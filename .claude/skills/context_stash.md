# Context Stash

**Comprehensive context saving for quantum cryptography and security-sensitive work.**

This skill teaches Claude when and how to save session context. The actual implementation is in slash commands.

---

## When to Use

Claude should proactively suggest context stashing when:
- User mentions ending session or taking a break
- Conversation is about to be compacted (`/compact`)
- After completing significant crypto/security work
- Before switching to a different task
- Session is getting long (context window filling up)
- After deployment or major milestone
- When sensitive operations were performed (key generation, etc.)

---

## How to Use

**Commands**:
- `/stash` - Save context (auto-uses branch name)
- `/stash <name>` - Save with custom name
- `/unstash` - Load context (auto-uses branch name)
- `/unstash <name>` - Load specific context
- `/stashcontext` - List all saved contexts

**Autocomplete Tip**: Type `/sta` → `/stash` or `/uns` → `/unstash`

**When to suggest**:

> "Should we run `/stash` to save context before [ending session/compacting/switching tasks]?"

**Multi-window workflow**:
- Each git branch gets its own context automatically
- Use named contexts for multiple tasks on same branch
- No more overwriting contexts!

---

## What It Captures

The `/stash` command saves comprehensive session state including:
- ✅ Active goals and completed work
- 🔬 Technical decisions and crypto algorithms used
- 🧪 Test status (unit, integration, security)
- 🔐 Cryptographic inventory (keys, security assumptions)
- 🔗 Integration points (blockchain deployments, RPC endpoints)
- 🔧 Environment state (Node version, dependencies)
- 📂 Files modified with context
- 🎨 Code patterns established
- 🔍 Complete git state
- 🚀 Quick resume command for next session
- 📚 Session history (rolling log)

---

## Implementation

When this skill is invoked, you MUST:

**Simply suggest to the user**:

> "Should we run `/stash` to save context?"

The slash command handles all the implementation details.

---

## Reference

For the complete template and implementation, see:
- **Stash**: [.claude/commands/stash.md](.claude/commands/stash.md) - Save context
- **Unstash**: [.claude/commands/unstash.md](.claude/commands/unstash.md) - Load context
- **List**: [.claude/commands/stashcontext.md](.claude/commands/stashcontext.md) - Show all contexts

---

## Proactive Suggestions

**Examples of when to suggest stashing**:

- User: "Let me take a break" → Suggest `/stash`
- User: "I'm going to compact now" → Suggest `/stash` first
- After major deployment → "Great! Want to `/stash` to save this state?"
- After crypto key generation → "Should we `/stash` to document the keys generated?"
- Long session → "Context is getting full, want to `/stash` before continuing?"
- Multiple windows open → "This will save to `{branch-name}.md` so it won't conflict with your other windows"
- User mentions switching branches → "Want to `/stash` first so you can come back with `/unstash`?"

---

## Multi-Context Workflow

**Problem Solved**: Multiple Claude Code windows no longer overwrite each other's contexts!

**How it works**:
- `/stash` on branch `solana-opo` → saves to `.claude/contexts/solana-opo.md`
- `/stash` on branch `base-v4` → saves to `.claude/contexts/base-v4.md`
- `/stash testing` on `main` → saves to `.claude/contexts/testing.md`

**Single branch, multiple windows**:
- Main debug window: `/stash main` → saves to `.claude/contexts/main.md`
- Meta/planning window: `/stash meta` → saves to `.claude/contexts/meta.md`
- Both windows on same branch, no conflicts!

**Opening a new window**:
1. User opens new window
2. User types `/unstash main` (or `/unstash meta` for planning)
3. Claude loads the appropriate context
4. Work continues seamlessly!

**Switching contexts**:
- `/stashcontext` - see all available contexts
- `/unstash <name>` - load specific context
- Use named contexts for multiple tasks on same branch

---

## Companion Skills

Future skills to create:
- **Resume from Stash**: Load and summarize `.claude/CURRENT_WORK.md`
- **Stash Diff**: Compare current state to last stash
