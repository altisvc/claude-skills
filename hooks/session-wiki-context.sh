#!/bin/bash
# SessionStart hook: inject wiki context so the agent starts every session
# knowing the company, agent roster, and tool routing rules.
# Keeps output compact — index + roster table + full tool routing.

WIKI_DIR="$(dirname "$0")/../../03-research/wiki"

echo "# Wiki Context (auto-loaded at session start)"
echo ""

# Wiki index — one-line summaries for quick lookup
if [ -f "$WIKI_DIR/index.md" ]; then
  sed -n '/^## /,$ p' "$WIKI_DIR/index.md"
  echo ""
fi

# Agent roster table — nicknames, tiers, functions, libs
if [ -f "$WIKI_DIR/gtm-agent-stack.md" ]; then
  echo "## GTM Agent Roster"
  sed -n '/^| Agent | Nickname/,/^$/p' "$WIKI_DIR/gtm-agent-stack.md"
  echo ""
fi

# Full tool routing — routing tables, internal agents, hard rules, auth reference
if [ -f "$WIKI_DIR/tool-routing.md" ]; then
  cat "$WIKI_DIR/tool-routing.md"
fi
