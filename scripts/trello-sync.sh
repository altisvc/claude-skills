#!/bin/bash
# Trello Sync — deterministic card create/complete from JSON payload
# Called by /checkin (Phase 2.5 gate) and overnight-checkin.sh
#
# Usage:
#   .claude/scripts/trello-sync.sh <payload.json>
#   echo '{"creates":[...],"completions":[...]}' | .claude/scripts/trello-sync.sh -
#
# Payload format:
# {
#   "creates": [
#     {"name": "Stanley: Fix thing", "list": "review", "desc": "...", "due": "2026-03-31T23:59:00Z"}
#   ],
#   "completions": [
#     {"keywords": "GA logo"}
#   ]
# }
#
# List values: "review", "action", "waiting", "intel", "done"
# Default list for creates: "review"
#
# Output: JSON summary of actions taken, written to stdout

set -euo pipefail

# Source shell profile for env vars (TRELLO_API_KEY, etc.)
source "$HOME/.zshrc" 2>/dev/null || true

# --- Auth check --- #

if [ -z "${TRELLO_API_KEY:-}" ] || [ -z "${TRELLO_TOKEN:-}" ]; then
  echo '{"error": "TRELLO_API_KEY or TRELLO_TOKEN not set", "creates": [], "completions": []}' >&2
  exit 1
fi

# --- List ID mapping (plain vars — macOS bash 3 has no associative arrays) --- #

LIST_ID_REVIEW="${TRELLO_LIST_REVIEW:-69b4486666ec1402500f2c81}"
LIST_ID_ACTION="${TRELLO_LIST_ACTION:-69c18090ea489437d47a72ca}"
LIST_ID_WAITING="${TRELLO_LIST_WAITING:-69b4486666ec1402500f2c83}"
LIST_ID_INTEL="${TRELLO_LIST_INTEL:-69b448cb6acb6eaccc4b7540}"
LIST_ID_DONE="${TRELLO_LIST_DONE:-69b448cdc9879065f2857585}"

BOARD_ID="${TRELLO_BOARD_ID:-UMXZpnLT}"
BASE_URL="https://api.trello.com/1"
AUTH="key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}"

# --- Read payload --- #

if [ "${1:-}" = "-" ] || [ -z "${1:-}" ]; then
  PAYLOAD=$(cat)
else
  PAYLOAD=$(cat "$1")
fi

# Validate JSON
if ! echo "$PAYLOAD" | python3 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
  echo '{"error": "Invalid JSON payload", "creates": [], "completions": []}' >&2
  exit 1
fi

# --- Create cards --- #

CREATES_COUNT=$(echo "$PAYLOAD" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('creates',[])))")
CREATES_RESULTS="[]"

if [ "$CREATES_COUNT" -gt 0 ]; then
  CREATES_RESULTS=$(echo "$PAYLOAD" | python3 -c "
import json, sys, urllib.request, urllib.parse

payload = json.load(sys.stdin)
results = []

list_ids = {
    'review': '${LIST_ID_REVIEW}',
    'action': '${LIST_ID_ACTION}',
    'waiting': '${LIST_ID_WAITING}',
    'intel': '${LIST_ID_INTEL}',
    'done': '${LIST_ID_DONE}'
}

for card in payload.get('creates', []):
    name = card.get('name', '')
    list_key = card.get('list', 'review')
    list_id = list_ids.get(list_key, list_ids['review'])
    desc = card.get('desc', '')
    due = card.get('due', '')

    params = {
        'key': '${TRELLO_API_KEY}',
        'token': '${TRELLO_TOKEN}',
        'idList': list_id,
        'name': name,
        'desc': desc
    }
    if due:
        params['due'] = due

    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request('${BASE_URL}/cards', data=data, method='POST')

    try:
        resp = urllib.request.urlopen(req)
        card_data = json.loads(resp.read())
        results.append({
            'status': 'created',
            'name': name,
            'list': list_key,
            'id': card_data.get('id', ''),
            'url': card_data.get('shortUrl', '')
        })
    except Exception as e:
        results.append({
            'status': 'error',
            'name': name,
            'error': str(e)
        })

print(json.dumps(results))
")
fi

# --- Complete cards (move to Done) --- #

COMPLETIONS_COUNT=$(echo "$PAYLOAD" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('completions',[])))")
COMPLETIONS_RESULTS="[]"

if [ "$COMPLETIONS_COUNT" -gt 0 ]; then
  # Fetch all cards on the board once — write to file to avoid shell string escaping issues
  CARDS_FILE=$(mktemp)
  curl -s "${BASE_URL}/boards/${BOARD_ID}/cards?${AUTH}&fields=name,idList,id" > "$CARDS_FILE"

  COMPLETIONS_RESULTS=$(python3 -c "
import json, sys, urllib.request, urllib.parse, os

payload = json.load(open('/dev/stdin'))
board_cards = json.load(open('${CARDS_FILE}'))
done_list_id = '${LIST_ID_DONE}'
api_key = '${TRELLO_API_KEY}'
api_token = '${TRELLO_TOKEN}'
base_url = '${BASE_URL}'
results = []

for completion in payload.get('completions', []):
    keywords = completion.get('keywords', '').lower().split()
    if not keywords:
        continue

    # Find matching cards (all keywords must appear in card name)
    matches = []
    for card in board_cards:
        card_name_lower = card['name'].lower()
        if card['idList'] == done_list_id:
            continue  # Already done
        if all(kw in card_name_lower for kw in keywords):
            matches.append(card)

    if len(matches) == 0:
        results.append({
            'status': 'no_match',
            'keywords': completion.get('keywords', ''),
            'error': 'No card found matching keywords'
        })
    elif len(matches) > 1:
        results.append({
            'status': 'ambiguous',
            'keywords': completion.get('keywords', ''),
            'matches': [m['name'] for m in matches],
            'error': 'Multiple cards match - resolve manually'
        })
    else:
        card = matches[0]
        params = {
            'key': api_key,
            'token': api_token,
            'idList': done_list_id
        }
        data = urllib.parse.urlencode(params).encode()
        req = urllib.request.Request(
            f'{base_url}/cards/{card[\"id\"]}',
            data=data,
            method='PUT'
        )
        try:
            urllib.request.urlopen(req)
            results.append({
                'status': 'completed',
                'name': card['name'],
                'id': card['id']
            })
        except Exception as e:
            results.append({
                'status': 'error',
                'name': card['name'],
                'error': str(e)
            })

print(json.dumps(results))
" <<< "$PAYLOAD")

  rm -f "$CARDS_FILE"
fi

# --- Output summary --- #

python3 -c "
import json
creates = json.loads('''${CREATES_RESULTS}''')
completions = json.loads('''${COMPLETIONS_RESULTS}''')
summary = {
    'creates': creates,
    'completions': completions,
    'total_created': sum(1 for c in creates if c.get('status') == 'created'),
    'total_completed': sum(1 for c in completions if c.get('status') == 'completed'),
    'errors': [c for c in creates + completions if c.get('status') == 'error']
}
print(json.dumps(summary, indent=2))
"

# --- Write session marker for hook enforcement --- #
touch "/tmp/trello-sync-$(date +%Y-%m-%d).marker"
