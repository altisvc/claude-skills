#!/bin/bash
# Trello Promote — move cards from Staging board to Ticket Tracker board
# Handles cross-board moves (requires idBoard), dedup, and verification.
#
# Called by /meeting-sync Stage 4E after user reviews staging board.
#
# Usage:
#   .claude/scripts/trello-promote.sh
#
# Reads all open cards from both staging lists, matches [WAIT] cards to
# Waiting On, everything else to Need to do. Dedup against existing Ticket
# Tracker cards before creating. Verifies each card landed on the right board.
#
# Output: JSON summary to stdout

set -euo pipefail

source "$HOME/.zshrc" 2>/dev/null || true

if [ -z "${TRELLO_API_KEY:-}" ] || [ -z "${TRELLO_TOKEN:-}" ]; then
  echo '{"error": "TRELLO_API_KEY or TRELLO_TOKEN not set"}' >&2
  exit 1
fi

BASE_URL="https://api.trello.com/1"
AUTH="key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}"

# --- Board and list IDs --- #

STAGING_LIST_CHRIS="69cae927a636f1513286c4c8"
STAGING_LIST_OTHERS="69cae92724267c237b534e78"

TICKET_BOARD="69b4486666ec1402500f2c5a"
TICKET_NEEDTODO="69c18090ea489437d47a72ca"
TICKET_WAITINGON="69b4486666ec1402500f2c83"

# --- Fetch all cards --- #

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

curl -s "${BASE_URL}/lists/${STAGING_LIST_CHRIS}/cards?${AUTH}&fields=id,name,desc,closed" > "$TEMP_DIR/staging-chris.json"
curl -s "${BASE_URL}/lists/${STAGING_LIST_OTHERS}/cards?${AUTH}&fields=id,name,desc,closed" > "$TEMP_DIR/staging-others.json"
curl -s "${BASE_URL}/boards/${TICKET_BOARD}/cards?${AUTH}&fields=id,name,desc,idList" > "$TEMP_DIR/tracker-cards.json"

# --- Promote via Python (env vars passed explicitly) --- #

export PROMOTE_TEMP_DIR="$TEMP_DIR"
export PROMOTE_API_KEY="$TRELLO_API_KEY"
export PROMOTE_API_TOKEN="$TRELLO_TOKEN"
export PROMOTE_TICKET_BOARD="$TICKET_BOARD"
export PROMOTE_NEEDTODO="$TICKET_NEEDTODO"
export PROMOTE_WAITINGON="$TICKET_WAITINGON"

python3 << 'PYEOF'
import json, sys, os, urllib.request, urllib.parse, time

BASE_URL = "https://api.trello.com/1"
API_KEY = os.environ["PROMOTE_API_KEY"]
API_TOKEN = os.environ["PROMOTE_API_TOKEN"]
TICKET_BOARD = os.environ["PROMOTE_TICKET_BOARD"]
TICKET_NEEDTODO = os.environ["PROMOTE_NEEDTODO"]
TICKET_WAITINGON = os.environ["PROMOTE_WAITINGON"]
TEMP_DIR = os.environ["PROMOTE_TEMP_DIR"]

def api_call(method, path, params=None):
    url = f"{BASE_URL}{path}"
    p = {"key": API_KEY, "token": API_TOKEN}
    if params:
        p.update(params)
    if method == "GET":
        url += "?" + urllib.parse.urlencode(p)
        req = urllib.request.Request(url)
    else:
        data = urllib.parse.urlencode(p).encode()
        req = urllib.request.Request(url, data=data, method=method)
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

def normalize(name):
    """Strip owner prefix and [WAIT] tag for dedup matching."""
    name = name.replace("[WAIT]", "").strip()
    parts = name.split(":", 1)
    if len(parts) == 2:
        return parts[1].strip().lower()
    return name.strip().lower()

def keyword_overlap(a, b):
    """Fraction of keywords in common."""
    wa = set(a.lower().split())
    wb = set(b.lower().split())
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / max(len(wa), len(wb))

# Load cards
with open(f"{TEMP_DIR}/staging-chris.json") as f:
    chris_cards = json.load(f)
with open(f"{TEMP_DIR}/staging-others.json") as f:
    others_cards = json.load(f)
with open(f"{TEMP_DIR}/tracker-cards.json") as f:
    tracker_cards = json.load(f)

staging_cards = [c for c in chris_cards + others_cards if not c.get("closed")]

if not staging_cards:
    print(json.dumps({"promoted": 0, "merged": 0, "errors": [], "message": "Staging board is empty"}))
    sys.exit(0)

# Index tracker cards for dedup
tracker_index = [(c["id"], normalize(c["name"]), c["name"]) for c in tracker_cards]

results = {"promoted": 0, "merged": 0, "errors": [], "details": []}

for card in staging_cards:
    card_id = card["id"]
    card_name = card["name"]
    card_desc = card.get("desc", "")
    is_wait = card_name.startswith("[WAIT]")
    target_list = TICKET_WAITINGON if is_wait else TICKET_NEEDTODO
    norm = normalize(card_name)

    # Dedup check
    duplicate = None
    for tid, tnorm, tname in tracker_index:
        if norm == tnorm:
            duplicate = (tid, tname)
            break
        if len(norm) >= 15 and (norm in tnorm or tnorm in norm):
            duplicate = (tid, tname)
            break
        if keyword_overlap(norm, tnorm) >= 0.6:
            duplicate = (tid, tname)
            break

    if duplicate:
        dup_id, dup_name = duplicate
        try:
            existing = api_call("GET", f"/cards/{dup_id}")
            new_desc = existing.get("desc", "") + f"\n\n---\n[Meeting Sync] {card_desc}"
            api_call("PUT", f"/cards/{dup_id}", {"desc": new_desc})
            api_call("PUT", f"/cards/{card_id}", {"closed": "true"})
            results["merged"] += 1
            results["details"].append({"action": "merged", "staging": card_name, "into": dup_name})
        except Exception as e:
            results["errors"].append({"card": card_name, "error": f"merge failed: {e}"})
        continue

    # Move cross-board (the key fix: idBoard + idList together)
    try:
        api_call("PUT", f"/cards/{card_id}", {
            "idBoard": TICKET_BOARD,
            "idList": target_list
        })

        # Verify card landed on the right board
        time.sleep(0.3)
        moved = api_call("GET", f"/cards/{card_id}")
        if moved.get("idBoard") != TICKET_BOARD:
            results["errors"].append({
                "card": card_name,
                "error": f"verification failed — card still on board {moved.get('idBoard')}"
            })
        else:
            results["promoted"] += 1
            dest = "Waiting On" if is_wait else "Need to do"
            results["details"].append({"action": "promoted", "card": card_name, "to": dest})
    except Exception as e:
        results["errors"].append({"card": card_name, "error": f"move failed: {e}"})

print(json.dumps(results, indent=2))
PYEOF
