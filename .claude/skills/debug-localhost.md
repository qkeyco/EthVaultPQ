# Debug Localhost Skill

**Trigger:** When localhost website (especially dashboard at port 5175) is not loading, showing white/black screen, or having rendering issues.

**Task:** Use Playwright browser automation to debug the localhost application until it's working.

---

## Debugging Process

### 1. Run Playwright Debug Test
```bash
cd dashboard
npx playwright test debug.spec.ts --project=chromium
```

### 2. Analyze Browser Console Errors
The debug test captures:
- JavaScript errors
- Page errors
- React rendering failures
- Missing dependencies
- Network errors

### 3. Common Issues & Fixes

#### Black/White Screen Issues:
- **Check for constructor errors** (e.g., `X is not a constructor`)
- **Check for missing providers** (e.g., `must be used within Provider`)
- **Check for import errors** (library breaking changes)

#### Fix Strategies:
1. **Library conflicts**: Replace with simpler alternatives
   - Example: RainbowKit → pure wagmi
2. **Missing context providers**: Add wrapper or disable feature
3. **Import errors**: Check library versions, revert if needed
4. **Cache issues**: Remind user to hard refresh (Cmd+Shift+R)

### 4. Verification Steps
- ✅ Root content length > 0
- ✅ Header text found
- ✅ No JavaScript errors
- ✅ Screenshot shows rendered content

### 5. Iterative Debugging
If test fails:
1. Read error messages from Playwright output
2. Identify root cause (constructor, import, provider, etc.)
3. Apply targeted fix
4. Restart dev server if needed (kill port, restart)
5. Re-run test
6. Repeat until test passes

## Exit Criteria
- Playwright test passes (green ✓)
- Screenshot shows fully rendered page
- No console errors in test output
- Root content length > 100 characters

## Notes
- Always use Playwright instead of manual browser debugging
- The test captures the ACTUAL browser state (not cached)
- Screenshots are saved to `dashboard-debug.png`
- Hard refresh required in user's browser after fix
