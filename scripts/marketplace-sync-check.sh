#!/bin/bash
# Marketplace Sync Check
# Runs mechanically (no LLM) at wrap time. Diffs .claude/ changes against
# HEAD and appends marketplace-relevant entries to the sync log.
#
# Usage: marketplace-sync-check.sh "session title"
# Called by /wrap Step 5.5. Exit 0 = entries logged, Exit 1 = nothing to log.

set -euo pipefail

REPO_DIR="$HOME/Desktop/altis-brain"
SYNC_LOG="$REPO_DIR/02-projects/operations/marketplace-sync-log.md"
SESSION_TITLE="${1:-untitled session}"
TODAY=$(date +%Y-%m-%d)

# Published skills in marketplace registry (update when new skills are published)
PUBLISHED_SKILLS="meeting-sync checkin wrap week-in-review audit consult-advisor"
PUBLISHED_AGENTS="advisor-ben-sun advisor-collison advisor-harrison-chase advisor-gartner-cso advisor-founding-pitchbook-cso advisor-mom-test advisor-founding-tegus-cio"
PUBLISHED_COMMANDS=""
PUBLISHED_SCRIPTS="trello-sync"

# Detect changes in .claude/ relative to HEAD
# Use --diff-filter to classify: A=added, M=modified, D=deleted
CHANGES=$(cd "$REPO_DIR" && git diff --name-only --diff-filter=AM HEAD -- \
  .claude/skills/ \
  .claude/agents/ \
  .claude/commands/ \
  .claude/scripts/ \
  .claude/hooks.json \
  2>/dev/null || true)

# Also check untracked new files
UNTRACKED=$(cd "$REPO_DIR" && git ls-files --others --exclude-standard -- \
  .claude/skills/ \
  .claude/agents/ \
  .claude/commands/ \
  .claude/scripts/ \
  2>/dev/null || true)

ALL_CHANGES=$(echo -e "${CHANGES}\n${UNTRACKED}" | sort -u | grep -v '^$' || true)

if [ -z "$ALL_CHANGES" ]; then
  exit 1  # Nothing to log
fi

# Classify each change
ENTRIES=""
ENTRY_COUNT=0
NEW_COUNT=0
RETROFIT_COUNT=0
CHECK_COUNT=0

while IFS= read -r file; do
  [ -z "$file" ] && continue

  # Determine type and name
  TYPE=""
  NAME=""
  ACTION=""

  case "$file" in
    .claude/skills/*/SKILL.md)
      TYPE="skill"
      NAME=$(echo "$file" | sed 's|.claude/skills/\(.*\)/SKILL.md|\1|')
      ;;
    .claude/skills/*)
      continue  # Skip non-SKILL.md files in skill dirs
      ;;
    .claude/agents/*.md)
      TYPE="agent"
      NAME=$(basename "$file" .md)
      ;;
    .claude/commands/*.md)
      TYPE="command"
      NAME=$(basename "$file" .md)
      ;;
    .claude/scripts/*.sh)
      TYPE="script"
      NAME=$(basename "$file" .sh)
      ;;
    .claude/hooks.json)
      TYPE="hooks"
      NAME="hooks.json"
      ;;
    *)
      continue
      ;;
  esac

  # Determine if NEW or RETROFIT
  # Check if file exists in HEAD (modified = retrofit, new = new)
  if cd "$REPO_DIR" && git show "HEAD:$file" &>/dev/null 2>&1; then
    # File existed before — check if it's published
    IS_PUBLISHED=false
    case "$TYPE" in
      skill)   echo "$PUBLISHED_SKILLS" | grep -qw "$NAME" && IS_PUBLISHED=true ;;
      agent)   echo "$PUBLISHED_AGENTS" | grep -qw "$NAME" && IS_PUBLISHED=true ;;
      command) echo "$PUBLISHED_COMMANDS" | grep -qw "$NAME" && IS_PUBLISHED=true ;;
      script)  echo "$PUBLISHED_SCRIPTS" | grep -qw "$NAME" && IS_PUBLISHED=true ;;
    esac

    if [ "$IS_PUBLISHED" = true ]; then
      ACTION="RETROFIT"
      RETROFIT_COUNT=$((RETROFIT_COUNT + 1))
    else
      ACTION="CHECK"
      CHECK_COUNT=$((CHECK_COUNT + 1))
    fi
  else
    # New file
    ACTION="NEW"
    NEW_COUNT=$((NEW_COUNT + 1))
  fi

  # Get a one-line summary of change
  DETAIL=""
  if [ "$ACTION" = "NEW" ]; then
    # First line of the file as description
    DETAIL=$(cd "$REPO_DIR" && head -1 "$file" 2>/dev/null | sed 's/^#\+ //' | head -c 80)
    [ -z "$DETAIL" ] && DETAIL="New file"
  else
    # Count lines changed
    LINES_CHANGED=$(cd "$REPO_DIR" && git diff HEAD -- "$file" 2>/dev/null | grep -c '^[+-]' || echo "?")
    DETAIL="${LINES_CHANGED} lines changed"
  fi

  ENTRIES="${ENTRIES}| ${TYPE} | ${NAME} | ${ACTION} | ${DETAIL} |\n"
  ENTRY_COUNT=$((ENTRY_COUNT + 1))

done <<< "$ALL_CHANGES"

if [ "$ENTRY_COUNT" -eq 0 ]; then
  exit 1
fi

# Ensure sync log exists with header
if [ ! -f "$SYNC_LOG" ]; then
  cat > "$SYNC_LOG" << 'HEADER'
# Marketplace Sync Log

Accumulated changes in altis-brain that need to be pushed to the skills marketplace (`altisvc/claude-skills` registry + `altisvc/altis-venture-insight` app).

Review this log before doing a marketplace push. Clear entries as they're ported.

---
HEADER
fi

# Append entry
{
  echo ""
  echo "### ${TODAY} — ${SESSION_TITLE}"
  echo ""
  echo "| Type | File | Action | Detail |"
  echo "|------|------|--------|--------|"
  echo -e "$ENTRIES"
} >> "$SYNC_LOG"

# Summary to stdout (captured by wrap)
echo "Marketplace sync: ${ENTRY_COUNT} items logged (${NEW_COUNT} new, ${RETROFIT_COUNT} retrofit, ${CHECK_COUNT} check)"
echo "  See 02-projects/operations/marketplace-sync-log.md"
