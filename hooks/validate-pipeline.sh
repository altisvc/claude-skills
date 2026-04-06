#!/bin/bash
# PreToolUse hook: Validate drafting pipeline adherence
# This hook runs before Write/Edit tools when creating outbound content

# Read the tool input from stdin (JSON format)
INPUT=$(cat)

# Extract relevant info
FILE_PATH=$(echo "$INPUT" | jq -r '.file_path // .filePath // ""')
CONTENT=$(echo "$INPUT" | jq -r '.content // ""')

# Check if this looks like outbound content
is_outbound_content() {
    local path="$1"
    local content="$2"

    # Check file path patterns
    if [[ "$path" =~ (email|linkedin|outbound|draft|message|dm) ]]; then
        return 0
    fi

    # Check content patterns (subject lines, greetings, CTAs)
    if echo "$content" | grep -qiE "(subject:|dear |hi |hello |looking forward|let me know|schedule a call|happy to|would love to)"; then
        return 0
    fi

    return 1
}

# Check if pipeline checkpoint was declared in context
# This is a simplified check - the real validation happens in CLAUDE.md instructions
check_pipeline_checkpoint() {
    # In a real implementation, this would check conversation context
    # For now, we output a reminder that gets surfaced to Claude
    echo "PIPELINE_CHECK_REQUIRED"
}

# Main validation
if is_outbound_content "$FILE_PATH" "$CONTENT"; then
    # Output validation message (will be shown to Claude)
    cat << 'EOF'
{
  "status": "warning",
  "message": "OUTBOUND CONTENT DETECTED - PIPELINE VALIDATION REQUIRED",
  "requirements": [
    "1. Verify PROCESS CHECKPOINT was declared",
    "2. Confirm brief was created (YAML format)",
    "3. Confirm drafter stage completed with metadata",
    "4. Confirm mechanics editor stage completed with variants",
    "5. If any stage was skipped, STOP and restart from beginning"
  ],
  "action": "If pipeline was not followed, abort this write and restart with proper process"
}
EOF
    # Exit 0 to allow but with warning (exit 1 would block)
    # Change to exit 1 if you want hard blocking
    exit 0
else
    # Not outbound content, allow without warning
    echo '{"status": "ok", "message": "Not outbound content - no pipeline required"}'
    exit 0
fi
