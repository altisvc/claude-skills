#!/bin/bash
# PostToolUse hook: Log outbound content creation for audit trail

INPUT=$(cat)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
FILE_PATH=$(echo "$INPUT" | jq -r '.file_path // .filePath // "unknown"')

# Append to audit log
LOG_DIR="$(dirname "$0")/../../06-daily-log"
LOG_FILE="$LOG_DIR/outbound-audit.log"

mkdir -p "$LOG_DIR"

echo "[$TIMESTAMP] Outbound content created: $FILE_PATH" >> "$LOG_FILE"

echo '{"status": "ok", "message": "Logged to outbound-audit.log"}'
exit 0
