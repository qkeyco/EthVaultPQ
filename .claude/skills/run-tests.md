# Run Tests Skill

This skill runs all dashboard tests (unit + E2E) and updates the test summary JSON file that the dashboard displays.

## What it does:

1. Runs unit tests with Vitest (`npm run test:unit`)
2. Runs E2E tests with Playwright (`npm test`)
3. Parses the test results
4. Updates `dashboard/public/test-summary.json` with the latest stats
5. Commits the updated test summary

## Usage:

When the user says "run tests" or "update test results", use this skill.

## Instructions:

### Step 1: Run Unit Tests

```bash
cd dashboard
npm run test:unit -- --reporter=json --outputFile=./test-results/unit-results.json
```

Parse the output and extract:
- Number of tests passed
- Number of tests failed
- Total tests
- Duration

### Step 2: Run E2E Tests

```bash
cd dashboard
npm test
```

Playwright automatically generates `test-results/results.json`. Parse it to extract:
- Number of tests passed
- Number of tests failed
- Total tests
- Duration

### Step 3: Update test-summary.json

Create or update `dashboard/public/test-summary.json` with:

```json
{
  "lastUpdated": "<ISO timestamp>",
  "unit": {
    "passed": <number>,
    "failed": <number>,
    "total": <number>,
    "duration": <seconds>,
    "details": [
      "✅ X tests passing",
      "❌ Y tests failing (description)",
      "📦 Z test files",
      "⏱️  ~Xs execution time"
    ]
  },
  "e2e": {
    "passed": <number>,
    "failed": <number>,
    "total": <number>,
    "duration": <seconds>,
    "details": [
      "✅ X tests passing",
      "❌ Y tests failing (description)",
      "🔄 Z interrupted",
      "⏭️  W not run",
      "⏱️  ~Xs execution time"
    ]
  },
  "all": {
    "passed": <unit.passed + e2e.passed>,
    "failed": <unit.failed + e2e.failed>,
    "total": <unit.total + e2e.total>,
    "duration": <unit.duration + e2e.duration>,
    "details": [
      "Unit: X/Y passing",
      "E2E:  A/B passing (Chromium only)",
      "Total: C/D passing"
    ]
  }
}
```

### Step 4: Commit the Results

```bash
git add dashboard/public/test-summary.json
git commit -m "Update test results summary"
```

### Step 5: Report to User

Provide a summary:
- Total tests run
- Pass rate
- Any failing tests that need attention
- Link to full results in dashboard

## Notes:

- Tests should run when dashboard is NOT being used (to avoid port conflicts)
- E2E tests may take 30+ seconds to run
- Some tests may fail in CI - that's expected for now
- The dashboard will automatically show updated results on next page load
