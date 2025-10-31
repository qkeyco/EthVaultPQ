---
description: Load saved context from previous session to continue work
---

# Unstash Session Command

Load and summarize saved context to seamlessly continue work.

**Multi-Context Support**: Works with multiple windows/tasks by loading from separate context files.

---

## Usage:

```bash
/unstash                  # Auto-loads from contexts/{current-branch}.md
/unstash <name>           # Loads from contexts/{name}.md
```

**Tip**: Type `/uns` and autocomplete will finish to `/unstash`

## Examples:

- `/unstash` → loads from `.claude/contexts/main.md` (if on main branch)
- `/unstash main` → loads from `.claude/contexts/main.md` (explicit)
- `/unstash meta` → loads from `.claude/contexts/meta.md` (explicit)
- `/unstash solana` → loads from `.claude/contexts/solana.md`

---

## Steps to Execute:

1. **Determine context name**:
   - If user provided a name (e.g., `/unstash solana`), use that
   - Otherwise, get current git branch name:
     ```bash
     git branch --show-current 2>/dev/null || echo "default"
     ```
   - Sanitize name (replace `/` with `-`, lowercase)

2. **Check if context file exists**:
   ```bash
   test -f .claude/contexts/{context-name}.md && echo "✅ Context file found" || echo "❌ No saved context found"
   ```

   If not found, try fallback to `CURRENT_WORK.md`:
   ```bash
   test -f .claude/CURRENT_WORK.md && echo "✅ Found legacy context" || echo "❌ No context found"
   ```

3. **Read the context file**:
   - Read `.claude/contexts/{context-name}.md` (or fallback file)
   - Parse all sections, paying special attention to:
     - 🎯 Active Goal
     - ✅ Completed This Session (last session)
     - 🔄 In Progress (with confidence levels)
     - 🚧 Blocked / Issues
     - 📋 Next Steps
     - 🚀 Quick Resume Command
     - 📊 Current Todo List

4. **Check current git state** and compare to saved state:
   ```bash
   git status --short
   git branch --show-current
   ```

5. **Present summary to user**:

```
🚀 Unstashing Session Context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Context: {context-name}
📅 Last Session: [timestamp from file]
🎯 Goal: [from Active Goal section]

✅ What We Completed:
[Bullet points from Completed section]

🔄 What Was In Progress:
[List items with confidence indicators 🟢🟡🔴]

📋 Next Steps:
1. [First next step]
2. [Second next step]
3. [Third next step]

🔍 Current Git State:
[Show if anything changed since last session]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━

Ready to continue! Starting with: [first next step]
```

6. **Update symlink** to point to this context:
   ```bash
   ln -sf contexts/{context-name}.md .claude/CURRENT_WORK.md
   ```

7. **Automatically begin first next step** (if clear and unambiguous)
   - Or ask user which step to start with if multiple options

---

## Smart Features:

- **Detect changes**: If git state differs from saved state, highlight what changed
- **Highlight blockers**: If there are blockers, mention them prominently
- **Load todos**: If there's a todo list, recreate it with TodoWrite
- **Check environment**: Verify Node version matches expected (18.x)
- **Warn about stale context**: If last session was >7 days ago, warn user context may be stale
- **Security awareness**: If cryptographic inventory exists, mention any keys/addresses that were generated

---

## Error Handling:

### If context file doesn't exist:
```
❌ No saved context found for "{context-name}"

Looks like this is a fresh session, or no context was saved with `/stash`.

Available contexts (use `/stashcontext` to see all):
[List any existing context files if they exist]

Would you like me to:
1. Start a new task (just tell me what to work on)
2. Load a different context (try `/unstash <name>`)
3. Look at recent git commits to understand what was being worked on
4. Check CLAUDE.md for project guidelines
```

### If wrong context loaded:
If user says "that's the wrong context" or similar:
```
Let me load the correct context. Which one?
[List available contexts from /stashcontext]

Or specify: `/unstash <name>`
```

---

## Integration with TodoWrite:

If the saved context has a "Current Todo List" section:
- Parse the todos
- Recreate them using TodoWrite tool
- Update statuses based on "Completed This Session"
- Mark any previously completed items as completed
- Set first pending item as in_progress

---

## Multi-Window Support:

This design solves the multiple-window problem:

✅ **Window A** (branch: `solana-opo`) runs `/unstash`
   → Loads from `.claude/contexts/solana-opo.md`

✅ **Window B** (branch: `base-v4`) runs `/unstash`
   → Loads from `.claude/contexts/base-v4.md`

✅ **No conflicts!** Each window/branch has its own context file.

✅ **Switch contexts**: `/unstash solana-testing` loads different context even on same branch

**Note**: Claude Code has a built-in `/us` command (MCP status), so use `/unstash` or type `/uns` for autocomplete.
