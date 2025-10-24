# Debug Browser Skill

**Trigger:** When you need to debug web pages using a real browser, interact with web UI elements, or test localhost applications with browser automation.

**Task:** Use the browser MCP server (Playwright) to navigate, interact, and debug web applications with full browser capabilities using accessibility-tree-based automation.

---

## Available Browser MCP Tools

The Playwright MCP provides these capabilities:
- `playwright_navigate` - Navigate to URLs
- `playwright_screenshot` - Capture screenshots
- `playwright_click` - Click elements
- `playwright_fill` - Fill form inputs
- `playwright_select` - Select dropdown options
- `playwright_evaluate` - Execute JavaScript in browser context
- `playwright_snapshot` - Get accessibility tree snapshot (structured, no vision models needed)

## Debugging Process

### 1. Navigate to Page
```
Use mcp__playwright_navigate to open the target URL
Example: http://localhost:5175 (dashboard)
```

### 2. Get Accessibility Snapshot (Recommended First Step)
```
Use mcp__playwright_snapshot to get structured accessibility tree
This provides semantic understanding of the page without vision models
Shows all interactive elements, text content, and structure
```

### 3. Capture Screenshot
```
Use mcp__playwright_screenshot to get visual state
This helps identify rendering issues immediately
```

### 4. Execute JavaScript for Debugging
```
Use mcp__playwright_evaluate to:
- Check console errors: console.error.toString()
- Inspect React components: window.__REACT_DEVTOOLS_GLOBAL_HOOK__
- Check loaded scripts: document.scripts
- Get error details: window.onerror
- Check DOM state: document.body.innerHTML
```

### 5. Interact with Elements
```
Use mcp__playwright_click, mcp__playwright_fill for:
- Testing button clicks
- Filling forms
- Triggering UI interactions
- Navigating between tabs/pages
```

## Common Debugging Scenarios

### Scenario 1: Localhost Not Loading (Black/White Screen)
1. Navigate to localhost:5175
2. Get accessibility snapshot to see page structure
3. Take screenshot
4. Evaluate JavaScript: `document.body.innerHTML.length`
5. Check console errors: `console.error`
6. Inspect for React errors
7. Identify and fix root cause

### Scenario 2: Metamask Snap Testing
1. Navigate to snap test page (test.html or debug-snap.html)
2. Get accessibility snapshot to see available buttons
3. Screenshot initial state
4. Click "Connect" button using mcp__playwright_click
5. Fill form fields if needed
6. Take screenshots at each step
7. Verify success/failure states

### Scenario 3: Component Not Rendering
1. Navigate to page
2. Get accessibility snapshot to see what's actually rendered
3. Evaluate: `document.querySelector('[data-testid="component"]')`
4. Check if element exists
5. Check computed styles
6. Check parent visibility
7. Debug CSS/React issues

### Scenario 4: Form Submission Issues
1. Navigate to form page
2. Get accessibility snapshot to identify form fields
3. Fill inputs with mcp__playwright_fill
4. Click submit with mcp__playwright_click
5. Evaluate network requests
6. Check success/error messages
7. Take screenshot of result

## Advantages of Playwright MCP

- **Accessibility-tree-based**: No vision models needed, structured semantic data
- **Real-time interaction**: Directly control browser through MCP
- **No test setup needed**: No spec files required
- **Interactive debugging**: Step-by-step investigation
- **JavaScript execution**: Run arbitrary code in browser context
- **Live inspection**: Query DOM state at any time
- **Flexible**: Not bound to test assertions
- **Structured snapshots**: Get page structure without parsing HTML

## Best Practices

1. **Start with accessibility snapshot** - Get structured page overview without vision models
2. **Then take screenshots** - Visual confirmation for layout issues
3. **Use evaluate for complex queries** - Get detailed state information
4. **Check console errors early** - Catch JavaScript issues immediately
5. **Use selectors wisely** - CSS selectors, role-based, or text content
6. **Wait for elements** - Ensure page is fully loaded before interaction
7. **Capture state changes** - Screenshot and snapshot before/after interactions

## Common JavaScript Evaluations

```javascript
// Check for errors
document.querySelectorAll('.error').length

// Get all console logs (if captured)
window.__consoleLogs || []

// Check React mount
document.getElementById('root').children.length

// Get all links
Array.from(document.links).map(l => l.href)

// Check loaded CSS
Array.from(document.styleSheets).length

// Get local storage
JSON.stringify(localStorage)

// Check for MetaMask
typeof window.ethereum !== 'undefined'
```

## Exit Criteria

- ✅ Issue identified and root cause found
- ✅ Fix applied and verified
- ✅ Screenshots confirm proper rendering
- ✅ No console errors in browser context
- ✅ Expected UI elements present and functional

## Notes

- Browser MCP uses Puppeteer (Chromium-based)
- Headless by default (can be configured)
- Supports both localhost and remote URLs
- Can handle authentication flows
- Works with SPAs (React, Vue, etc.)
- Can test MetaMask Snap interactions
- More flexible than Playwright for exploratory debugging

## When to Use This Skill vs debug-localhost

**Use debug-browser (this skill) when:**
- You need real-time browser interaction
- Investigating unknown issues
- Manual step-by-step debugging
- Testing specific user flows
- Need JavaScript execution in browser
- Visual inspection is critical

**Use debug-localhost when:**
- Running automated test suites
- Known test cases to verify
- CI/CD integration needed
- Regression testing
- Performance metrics needed
