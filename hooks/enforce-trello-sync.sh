#!/bin/bash
# PreToolUse hook: Block check-in Phase 3 writes unless Trello sync has run this session
# Pattern: fires on daily-log writes. If trello-sync marker is missing, block.

MARKER="/tmp/trello-sync-$(date +%Y-%m-%d).marker"

if [ -f "$MARKER" ]; then
  echo '{"status": "ok", "message": "Trello sync already executed this session"}'
  exit 0
else
  cat << 'EOF'
{
  "status": "blocked",
  "message": "TRELLO SYNC NOT EXECUTED — Cannot write daily log or briefing until trello-sync.sh has run. Build the JSON payload and execute: .claude/scripts/trello-sync.sh /tmp/trello-sync-payload.json"
}
EOF
  exit 1
fi
