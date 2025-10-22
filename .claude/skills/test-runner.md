# Test Runner Skill

Automatically run all tests in the project, diagnose failures, fix what can be fixed, and report blockers.

---

## Purpose

Run the complete test suite (Foundry, Playwright, Vitest), analyze failures, attempt automated fixes, and provide a comprehensive report.

## When to Use

- After making code changes
- Before committing/deploying
- When user asks to "run tests" or "fix tests"
- Proactively before pushing to production

## Test Suites

### 1. Foundry (Smart Contract Tests)
**Location:** `test/*.sol`
**Command:** `forge test`
**Expected:** 21 tests total

### 2. Playwright (E2E Browser Tests)
**Location:** `dashboard/tests/e2e/*.spec.ts`
**Command:** `cd dashboard && npm test`
**Expected:** ~5 test files

### 3. Vitest (Unit Tests)
**Location:** `dashboard/tests/unit/**/*.test.ts`
**Command:** `cd dashboard && npm run test:unit`
**Expected:** ~2-5 test files

## Execution Steps

### Step 1: Check Environment
```bash
# Verify all configs exist
ls -la foundry.toml dashboard/playwright.config.ts dashboard/vitest.config.ts

# Check npm dependencies
cd dashboard && npm list --depth=0
```

### Step 2: Run Foundry Tests
```bash
# Run with detailed output
forge test --gas-report 2>&1 | tee /tmp/foundry-test.log

# Parse results
grep -E "Ran|passed|failed|PASS|FAIL" /tmp/foundry-test.log
```

**Common Fixes:**
- **"Salt cannot be zero"**: Update test salt values from 0 to 1
- **Block number vs timestamp**: Use `vm.roll` instead of `vm.warp`
- **Invalid validator**: Check PQValidator deployment in setUp

### Step 3: Run Vitest (Unit Tests)
```bash
cd dashboard && npm run test:unit 2>&1 | tee /tmp/vitest-test.log
```

**Common Fixes:**
- **Module not found**: `rm -rf node_modules package-lock.json && npm install`
- **Type errors**: Update tsconfig.json with `"strict": false`
- **Import errors**: Check vite.config.ts aliases

### Step 4: Run Playwright (E2E Tests)
```bash
cd dashboard && npm test 2>&1 | tee /tmp/playwright-test.log
```

**Common Fixes:**
- **Browser not installed**: `npx playwright install`
- **Test timeout**: Increase timeout in playwright.config.ts
- **Page not found**: Check if dev server is running

### Step 5: Analyze Failures

**Categorize by type:**
1. **Fixable** - Missing dependencies, config issues, simple code fixes
2. **Test Updates Needed** - API changes, component refactors
3. **Blockers** - Real bugs, missing features, external dependencies

### Step 6: Auto-Fix What's Possible

**Fixable Issues:**
```bash
# NPM dependency issues
cd dashboard && rm -rf node_modules package-lock.json && npm install

# Missing browsers
npx playwright install chromium

# Stale builds
forge clean && forge build
```

**Code Fixes (use Edit tool):**
- Update test data (salts, addresses)
- Fix imports
- Update deprecated APIs

### Step 7: Report Results

**Format:**
```markdown
## Test Results Summary

### Foundry (Solidity)
✅ Passed: 12/21
❌ Failed: 9/21
- 1 PQWallet test: setUp failure (validator)
- 4 PQVault tests: Block number calculations
- 4 Dilithium tests: Placeholder implementation

### Playwright (E2E)
✅ Passed: X/Y
❌ Failed: Z/Y
[List failures]

### Vitest (Unit)
✅ Passed: X/Y
❌ Failed: Z/Y
[List failures]

## Blockers
1. [Description of unfixable issues]

## Fixed
1. [What was auto-fixed]

## Needs Manual Fix
1. [What requires human intervention]
```

## Advanced: Use Playwright MCP

If browser MCP is available:

```typescript
// Use MCP to interact with test tab
await browser.goto('http://localhost:3000/test');
await browser.click('[data-testid="run-all-tests"]');
await browser.waitFor('[data-testid="test-results"]');
const results = await browser.evaluate(() => {
  return document.querySelector('[data-testid="test-results"]').textContent;
});
```

## Integration with TodoWrite

Track progress:
```
1. [in_progress] Running Foundry tests
2. [pending] Running Playwright E2E tests
3. [pending] Running Vitest unit tests
4. [pending] Analyzing failures
5. [pending] Applying fixes
```

## Error Handling

**If tests can't run:**
1. Check if project builds: `forge build` / `npm run build`
2. Check dependencies: `forge install` / `npm install`
3. Check configs are valid
4. Report as blocker

**If tests timeout:**
1. Increase timeout in configs
2. Check for infinite loops
3. Check for missing mocks

## Success Criteria

✅ **All tests run** (even if some fail)
✅ **Results are parsed and categorized**
✅ **Auto-fixable issues are fixed**
✅ **Blockers are clearly identified**
✅ **Report is comprehensive**

## Example Usage

**User:** "Run all tests and fix what you can"

**Agent:**
1. Runs Foundry: 12/21 passing
2. Runs Vitest: 5/5 passing (after npm install fix)
3. Runs Playwright: 4/5 passing (1 timeout - blocker)
4. Auto-fixes: NPM dependencies, test salts
5. Reports: Vault block calculations need manual fix
6. Commits fixes

## Notes

- Always commit fixes with descriptive messages
- Don't modify test expectations unless they're clearly wrong
- If >50% tests fail, investigate build/setup issues first
- Use `--reporter=json` for machine-readable output
- Save all test logs to /tmp for debugging
