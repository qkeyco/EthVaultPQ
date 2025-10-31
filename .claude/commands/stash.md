---
description: Save current conversation context before ending session or compacting
---

# Context Stash Command

**Enhanced for Quantum Cryptography Work**: Captures technical decisions, security assumptions, test states, and crypto-specific context critical for maintaining continuity in complex security-sensitive projects.

**Multi-Context Support**: Works with multiple windows/tasks by saving to separate context files.

---

## Usage:

```bash
/stash                    # Auto-saves to contexts/{current-branch}.md
/stash <name>             # Saves to contexts/{name}.md
```

**Tip**: Type `/sta` and autocomplete will finish to `/stash`

## Examples:

- `/stash` → saves to `.claude/contexts/main.md` (if on main branch)
- `/stash main` → saves to `.claude/contexts/main.md` (explicit)
- `/stash meta` → saves to `.claude/contexts/meta.md` (explicit)
- `/stash solana` → saves to `.claude/contexts/solana.md`

---

## Steps to Execute:

1. **Determine context name** (with smart detection):
   - If user provided a name (e.g., `/stash solana`), use that name
   - Otherwise, **auto-detect from last used**:

     **A. Check window-specific marker file**:
     ```bash
     # Check if this window has saved before
     if [ -f .claude/.window-context ]; then
       cat .claude/.window-context
       # Returns: "main" or "meta" or whatever was last used in this window
     fi
     ```

     **B. If no marker exists, check symlink**:
     ```bash
     # Check if CURRENT_WORK.md points to a specific context
     readlink .claude/CURRENT_WORK.md 2>/dev/null | sed 's/contexts\///' | sed 's/.md$//'
     # If it points to contexts/meta.md, extract "meta"
     ```

     **C. Fall back to git branch**:
     ```bash
     git branch 2>/dev/null | grep '^\*' | sed 's/^* //' || echo "default"
     ```

   - Sanitize name (replace `/` with `-`, lowercase)

2. **Create contexts directory if needed**:
   ```bash
   mkdir -p .claude/contexts
   ```

3. **Save to context file** at `.claude/contexts/{context-name}.md` using this structure:

```markdown
# Current Work Session

**Last Updated**: {{CURRENT_TIMESTAMP}}
**Session Duration**: [estimate from conversation]

---

## 🎯 Active Goal
[One sentence: what are we trying to achieve right now?]

---

## ✅ Completed This Session
*Updated: {{TIMESTAMP}}*

- [List everything accomplished with file paths]
- [Include successful tests, deployments, fixes]
- [Note key decisions made]

---

## 🔄 In Progress
*Updated: {{TIMESTAMP}}*

- [What's currently being worked on] 🟢/🟡/🔴 [confidence level]
- [Which files are being modified]
- [Current step in the process]

**Confidence Indicators:**
- 🟢 High confidence, clear path forward
- 🟡 Medium confidence, some unknowns
- 🔴 Low confidence, needs research/decisions

---

## 🚧 Blocked / Issues
*[Only show this section if there are actual blockers]*

- [Any errors encountered]
- [Questions needing answers]
- [Dependencies or decisions required]
- [What's needed to unblock]

---

## 📋 Next Steps
1. [Immediate next action when resuming]
2. [Following steps in priority order]
3. [Any prep work needed]

---

## 🧠 Key Decisions Made
*Updated: {{TIMESTAMP}}*

- [Architecture choices with rationale]
- [Tech stack selections]
- [Trade-offs and why]
- [What alternatives were considered and rejected]

---

## 🔬 Technical Deep Dive
*[Only include if technical/crypto work was done]*

### Algorithms & Approaches Used
- [Specific crypto algorithms: e.g., "Dilithium lattice signatures"]
- [Performance characteristics: "O(n²) but acceptable for <1000 keys"]
- [Security parameters: "128-bit quantum security level"]

### Why This Approach
- [Rationale for technical decisions]
- [Alternatives considered and rejected]
- [References to papers/specs: "Following NIST PQC Round 3 spec"]

---

## 🧪 Test Status
*[Only include if tests were run]*

- ✅ Unit tests: [X/Y passing, or "all passing"]
- ⚠️  Integration tests: [status + what's failing if any]
- 🔐 Security validations: [what's been verified]
- ⏱️  Performance benchmarks: [key metrics if measured]

---

## 🔐 Cryptographic Inventory
*[Only include if crypto operations occurred]*

### Keys & Addresses Generated This Session
- [Test wallets, addresses, key identifiers + storage location]
- [Quantum key pairs generated]

### Security Assumptions
- [List threat model assumptions made]
- [Known vulnerabilities being addressed]
- [Attack vectors not yet handled]

### Compliance & Audit Trail
- [Standards compliance: FIPS, NIST PQC, etc.]
- [Changes requiring security review]
- [Audit log entries needed]

### ⚠️ DO NOT COMMIT
- [List any sensitive test data, private keys, etc.]

---

## 🔗 Integration Points
*[Only include if working on integrations]*

### Blockchain Status (Base/Solana)
- Chain: [Base Sepolia, Solana Devnet, etc.]
- Program/Contract deployed to: [address]
- Last deployment: [timestamp]
- IDL/ABI location: [path]

### External Dependencies
- RPC endpoint: [URL or "using default"]
- MCP servers active: [list or "none"]
- API keys needed: [which ones, where stored]

---

## 🔧 Environment State

**Node Version**: [from `node --version`, should be 18.x per policy]

**Key Dependencies**:
- [List critical deps, especially crypto libs with versions]
- [Any version pinning decisions made]

**Environment Variables Needed**:
- [List critical env vars required to run/test]

**External Services**:
- [Solana RPC, Tenderly, etc. with status]

---

## 📂 Files Modified

[For each significant file, provide context:]

- `path/to/file.ext:line-range`
  - **What**: [description of change]
  - **Why**: [reason for change]
  - **Note**: [security/performance considerations]

---

## 🎨 Code Patterns Established
*[Only include if new patterns were established]*

- **Error handling**: [the pattern we're using]
- **Async patterns**: [promises vs async/await approach]
- **Naming conventions**: [e.g., "quantum keys prefixed with 'qk_'"]
- **File organization**: [structure decisions made]
- **Testing approach**: [unit vs integration, mocking strategy]

---

## 💡 Context for Next Session

[Critical info Claude needs to resume seamlessly]
[User preferences or constraints mentioned]
[Links to relevant docs or references]

---

## 🚀 Quick Resume Command

When starting next session, use this prompt:

> Read `.claude/CURRENT_WORK.md`. We're implementing [X].
> Last we left off, we completed [Y] and need to [Z next].
> Continue from [specific file/function].

---

## ✨ Last Known Good State

- **Commit SHA**: [hash from git log -1]
- **All tests passing**: [timestamp or "not verified"]
- **Feature working**: [what was functional]
- **Rollback command**: `git reset --hard [hash]`

---

## 📊 Session Metrics

- **Files in context**: [approximate count]
- **Session quality**: 🟢 Good / 🟡 Getting noisy / 🔴 Should clear
- **Compactions this session**: [count if tracked]

---

## 📊 Current Todo List
[Copy the active TodoWrite state if applicable]

---

## 📚 Session History (Last 5 Sessions)
*[Keep a rolling log for pattern recognition]*

- {{CURRENT_DATE_TIME}}: [Brief summary] [✅/🔄/❌]
- [Previous session]: [Brief summary] [✅/🔄/❌]
- [... up to 5 most recent]

---

## 🔍 Git State

**Branch**: [from git branch --show-current]

**Status**:
```
[Output from git status --short]
```

**Recent Commits** (last 5):
```
[Output from git log --oneline -5]
```

**Diff Summary**:
```
[Output from git diff --stat if there are changes]
```

**Branch Tracking**:
```
[Output from git branch -vv]
```

**Package Changes**:
*[Only show if package.json was modified]*
```
[Summary of dependency changes from git diff package.json]
```
```

---

## Steps to Execute:

1. **Capture comprehensive git state** by running:
   ```bash
   git status --short
   git branch --show-current
   git log --oneline -5
   git diff --stat
   git branch -vv
   ```

2. **Capture environment state** by running:
   ```bash
   node --version
   ```

3. **Check for package.json changes** (if applicable):
   ```bash
   git diff package.json 2>/dev/null | head -30
   ```

4. **Intelligently populate sections**:
   - Only include sections with actual content
   - Skip "Blocked/Issues" if none exist
   - Skip "Cryptographic Inventory" if no crypto work done
   - Skip "Test Status" if tests weren't run
   - Skip "Technical Deep Dive" if no technical decisions made
   - Skip "Integration Points" if no integration work done
   - Skip "Code Patterns Established" if no new patterns
   - Add timestamps to all major sections
   - Add confidence indicators (🟢🟡🔴) to "In Progress" items

5. **Append to session history**:
   - Add current session summary to "Session History" section
   - Keep rolling log of last 5 sessions
   - Format: `[timestamp]: [summary] [status emoji]`

6. **Create/update symlink** to latest context:
   ```bash
   ln -sf contexts/{context-name}.md .claude/CURRENT_WORK.md
   ```

7. **Save window marker** for auto-detection next time:
   ```bash
   echo "{context-name}" > .claude/.window-context
   ```
   This allows `/stash` (no args) to remember which context this window uses.

8. **Save current token count** for status line tracking:
   ```bash
   # Calculate total tokens (from conversation metrics)
   total_tokens=$((input_tokens + output_tokens))
   echo "$total_tokens" > ~/.claude/tokens-{context-name}.txt
   ```
   This allows the status line to show tokens used since last stash.

9. **Confirm to user** with summary:

```
✅ Context saved to `.claude/contexts/{context-name}.md`
   (symlinked from CURRENT_WORK.md)

Session Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 Context: {context-name}
🎯 Goal: [one-line summary]
✅ Done: [2-3 key accomplishments]
🔄 Next: [immediate next step]
🔒 Security: [any crypto/security notes if applicable]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To resume: `/unstash` or `/unstash {context-name}`
List all contexts: `/stashcontext`
```

---

## Multi-Window Support:

This design solves the multiple-window problem:

✅ **Window A** (branch: `solana-opo`) runs `/stash`
   → Saves to `.claude/contexts/solana-opo.md`

✅ **Window B** (branch: `base-v4`) runs `/stash`
   → Saves to `.claude/contexts/base-v4.md`

✅ **No conflicts!** Each window/branch has its own context file.

**Pro tip**: Use named contexts when working on multiple tasks in the same branch:
- `/stash solana-deployment`
- `/stash solana-testing`

## Single-Branch Multi-Window Workflow:

**If you only use one git branch but have multiple Claude Code windows:**

✅ **Main Debug Window** (actual dev work):
```bash
/stash main       # or /stash dev
```
→ Saves to `.claude/contexts/main.md`

✅ **Meta/Planning Window** (planning, documentation, stash system):
```bash
/stash meta       # or /stash planning
```
→ Saves to `.claude/contexts/meta.md`

**Important**: Without explicit names, both windows would save to the same file (branch name)!

**Best Practice**:
- First time in each window, use explicit name: `/stash main` or `/stash meta`
- After that, Claude should detect the existing context and suggest same name
- CURRENT_WORK.md symlink will always point to the last saved context
