#!/bin/bash

# Auto-commit hook for EthVaultPQ
# Commits changes after significant builds

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to commit"
    exit 0
fi

# Get changed files
CHANGED_FILES=$(git status --short)

# Determine commit message based on changes
if echo "$CHANGED_FILES" | grep -q "prisma/schema.prisma"; then
    CATEGORY="database schema"
elif echo "$CHANGED_FILES" | grep -q "\.sol$"; then
    CATEGORY="smart contracts"
elif echo "$CHANGED_FILES" | grep -q "src/components/"; then
    CATEGORY="UI components"
elif echo "$CHANGED_FILES" | grep -q "src/lib/"; then
    CATEGORY="libraries"
elif echo "$CHANGED_FILES" | grep -q "\.md$"; then
    CATEGORY="documentation"
else
    CATEGORY="project files"
fi

# Stage all changes
git add -A

# Create commit with detailed message
git commit -m "$(cat <<EOF
Auto-commit: Update $CATEGORY

Changes:
$(git diff --staged --stat | head -10)

🤖 Auto-committed after significant build

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Play success sound
if command -v afplay &> /dev/null; then
    afplay /System/Library/Sounds/Hero.aiff &
fi

echo ""
echo "✅ Changes committed successfully!"
echo "📊 Commit: $(git log -1 --oneline)"
echo ""

# Optional: Push to remote (uncomment if desired)
# echo "🔄 Pushing to remote..."
# git push origin $(git branch --show-current)

exit 0
