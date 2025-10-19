#!/bin/bash

# Post-tool-use hook for EthVaultPQ
# Plays a positive sound, counts to 10, and continues
# Auto-compacts if remaining tokens < 10%

# Get the tool that was just used
TOOL_NAME="$1"
TOOL_STATUS="$2"

# Play positive sound (macOS)
if command -v afplay &> /dev/null; then
    afplay /System/Library/Sounds/Tink.aiff &
fi

# Count to 10 with progress indicator
echo ""
echo "✅ Tool completed: $TOOL_NAME"
echo "⏳ Continuing in..."
for i in {10..1}; do
    echo -n "$i "
    sleep 0.5
done
echo ""
echo "🚀 Resuming work..."
echo ""

# Auto-compact if token usage > 90%
# This is a placeholder - Claude Code will handle the actual compaction
# based on the session's token budget

exit 0
