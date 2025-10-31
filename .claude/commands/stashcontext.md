---
description: List all saved context files with timestamps and summaries
---

# Stash Context Command

List all saved context files to help you choose which one to load.

---

## Usage:

```bash
/stashcontext          # List all saved contexts
```

---

## Steps to Execute:

1. **Check if contexts directory exists**:
   ```bash
   test -d .claude/contexts && echo "✅ Contexts found" || echo "❌ No contexts saved yet"
   ```

2. **List all context files** with metadata:
   ```bash
   ls -lt .claude/contexts/*.md 2>/dev/null
   ```

3. **For each context file**, extract:
   - Context name (filename without `.md`)
   - Last updated timestamp (from file modification time)
   - Active goal (from "## 🎯 Active Goal" section)
   - Last session date (from "**Last Updated**:" line)

4. **Check which is currently active**:
   ```bash
   readlink .claude/CURRENT_WORK.md 2>/dev/null
   ```

5. **Present formatted list**:

```
📂 Saved Contexts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current branch: main
Active context: → main.md

Available contexts:

1. main.md ⭐ (ACTIVE)
   Last updated: 2025-10-29 14:30
   Goal: Building context management system
   Modified: 2 hours ago

2. solana-opo.md
   Last updated: 2025-10-29 10:15
   Goal: Deploying Solana OPO hook to devnet
   Modified: 6 hours ago

3. base-v4.md
   Last updated: 2025-10-28 16:45
   Goal: Testing Base V4 lottery integration
   Modified: 1 day ago

4. testing.md
   Last updated: 2025-10-27 09:30
   Goal: Running integration tests on Tenderly
   Modified: 2 days ago

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To load a context: `/unstash <name>`
To save current work: `/stash <name>`

Tip: Use `/unstash` without arguments to auto-load based on branch.
```

---

## Smart Features:

- **Mark active context** with ⭐ (based on CURRENT_WORK.md symlink)
- **Show relative time** ("2 hours ago", "1 day ago")
- **Highlight stale contexts** (>7 days old) with ⚠️
- **Sort by recency** (most recent first)
- **Extract goals** to help user remember what each context was about

---

## Additional Commands:

After listing contexts, offer:

```
Would you like to:
1. Load a context - `/unstash <name>`
2. Save current work - `/stash <name>`
3. Delete old contexts - I can help clean up
4. See detailed info - Tell me which context number
```

---

## If No Contexts Exist:

```
📂 No Saved Contexts

You haven't saved any contexts yet!

To save your current work:
- `/stash` - auto-saves to current branch name
- `/stash <name>` - saves with custom name

Try running `/stash` now to save this session!
```

---

## Maintenance Helper:

If user asks to "clean up old contexts", offer to:
- Archive contexts older than 30 days
- Delete contexts for merged/deleted branches
- Move to `.claude/contexts/archive/` directory
