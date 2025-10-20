#!/bin/bash

# Post-Response Hook: Plays a sound notification when Claude needs user input
# This runs after every Claude response

# Play system sound (macOS)
if command -v afplay &> /dev/null; then
    # Use Glass sound (pleasant notification)
    afplay /System/Library/Sounds/Glass.aiff &
fi

# Alternative: Use say command for voice notification (optional, commented out)
# say "Task complete" &

# Alternative: Use terminal bell
# printf '\a'

exit 0
