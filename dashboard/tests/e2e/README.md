# Playwright E2E Tests for EthVaultPQ Dashboard

Comprehensive end-to-end testing suite for the EthVaultPQ post-quantum vault and wallet management dashboard.

## Test Coverage

### Navigation Tests (`navigation.spec.ts`)
- ✅ Dashboard homepage loading
- ✅ Tab navigation (Home, Deploy, Wallets, Vesting, Oracles, Settings)
- ✅ Tab switching and active state
- ✅ Tenderly dashboard link
- ✅ Footer and protocol info
- ✅ Responsive mobile layout
- ✅ Home page stats and content

### Vesting Builder Tests (`vesting-builder.spec.ts`)
- ✅ Default values and initial state
- ✅ Preset selection (60-month linear, 4-year cliff, custom)
- ✅ Mode switching (Test vs Production)
- ✅ Total amount configuration
- ✅ Custom cliff and vesting periods
- ✅ Past-due date warnings
- ✅ Multi-recipient setup
- ✅ Recipient percentage validation
- ✅ Vault toggle functionality
- ✅ Recipient removal
- ✅ Real-time summary updates
- ✅ Import/export toolbar visibility

### Import/Export Tests (`import-export.spec.ts`)
- ✅ Export schedule to JSON file
- ✅ Import from JSON file
- ✅ Template library imports (60-month, 4-year, multi-recipient, test)
- ✅ Copy to clipboard
- ✅ Paste from clipboard
- ✅ JSON structure validation
- ✅ Recipient percentage validation on import
- ✅ Round-trip export/import
- ✅ Template file existence and validity
- ✅ Template allocation correctness

## Running Tests

### Prerequisites
```bash
cd dashboard
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Headed Mode (see browser)
```bash
npm run test:headed
```

### Run Tests in UI Mode (interactive)
```bash
npm run test:ui
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test navigation.spec.ts
```

### Run Specific Test
```bash
npx playwright test -g "should load the dashboard homepage"
```

### View Test Report
```bash
npm run test:report
```

## Test Architecture

### Page Object Model
Tests use Page Object Model pattern for maintainability:

**`helpers/fixtures.ts`**
- `DashboardPage` - Main navigation and layout
- `VestingBuilderPage` - Vesting schedule configuration
- `DeployPage` - Contract deployment interface

**`helpers/test-data.ts`**
- Test addresses (wallets and vaults)
- Sample vesting schedules
- Expected block calculations
- Helper functions for date generation

### Test Data

**Valid Test Addresses:**
```typescript
VALID_WALLET_1: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8'
VALID_WALLET_2: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c'
VALID_VAULT_1: '0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21'
```

**Pre-configured Schedules:**
- `SIMPLE_LINEAR` - 60-month test mode
- `WITH_CLIFF` - 4-year production with 1-year cliff
- `MULTI_RECIPIENT` - 3 recipients (2 wallets + 1 vault)
- `FAST_TEST` - 5-minute test schedule

## Browser Coverage

Tests run on:
- ✅ **Chromium** (Desktop Chrome)
- ✅ **Firefox** (Desktop Firefox)
- ✅ **WebKit** (Desktop Safari)
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

## CI/CD Integration

Tests run automatically on:
- Push to `main`, `master`, or `develop` branches
- Pull requests to main branches
- Only when `dashboard/**` files change

### GitHub Actions Workflow
Location: `.github/workflows/playwright.yml`

**Features:**
- Automated browser installation
- Parallel test execution
- Test report artifacts (30-day retention)
- PR comment with test results
- Screenshot/video on failure

### Viewing CI Results
1. Go to GitHub Actions tab
2. Select "Playwright Tests" workflow
3. Download artifacts for reports/screenshots

## Writing New Tests

### Basic Test Template
```typescript
import { test, expect } from './helpers/fixtures';

test.describe('Feature Name', () => {
  test('should do something', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Your test code here
    await expect(vestingBuilder.page.getByText(/Expected Text/)).toBeVisible();
  });
});
```

### Using Page Objects
```typescript
test('should configure vesting', async ({ vestingBuilder }) => {
  await vestingBuilder.goto();
  await vestingBuilder.selectPreset('60-Month Linear');
  await vestingBuilder.setTotalAmount('1000000');
  await vestingBuilder.expectValidAllocation();
});
```

### Best Practices
1. **Use Page Objects** - Don't use raw selectors in tests
2. **Use semantic selectors** - Prefer `getByRole`, `getByLabel` over CSS
3. **Wait for states** - Use `waitForLoadState`, `waitForTimeout` appropriately
4. **Clean test data** - Use fixtures for reusable test data
5. **Descriptive names** - Test names should describe behavior
6. **One assertion per concept** - Keep tests focused

## Debugging Failed Tests

### Local Debugging
```bash
# Run in headed mode to see browser
npm run test:headed

# Use UI mode for interactive debugging
npm run test:ui

# Use debug mode for step-through
npm run test:debug
```

### CI Debugging
1. Download test artifacts from GitHub Actions
2. Extract `playwright-report.zip`
3. Open `index.html` in browser
4. View screenshots/videos of failures

### Common Issues

**Port 5175 in use:**
```bash
lsof -ti:5175 | xargs kill -9
```

**Dev server not starting:**
- Check `vite.config.ts` configuration
- Ensure dependencies installed: `npm install`

**Import tests failing:**
- Verify template files exist in `templates/` directory
- Check file permissions

## Performance

**Test Execution Time:**
- Navigation tests: ~10 seconds
- Vesting builder tests: ~30 seconds
- Import/export tests: ~45 seconds
- **Total suite**: ~90 seconds (all browsers)

**Optimization Tips:**
- Use `fullyParallel: true` in config
- Mock slow API calls when possible
- Use smaller viewports for mobile tests

## Accessibility Testing

The suite includes `@axe-core/playwright` for accessibility checks.

**To add accessibility tests:**
```typescript
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Test Data Cleanup

Tests are **read-only** and don't modify state. No cleanup required.

For future tests that modify blockchain state:
- Use Tenderly virtual testnet snapshots
- Reset state between test runs
- Use unique addresses per test

## Contributing

When adding new features:
1. Write tests FIRST (TDD approach)
2. Use existing page objects when possible
3. Add new page objects for new pages/components
4. Update this README with new test coverage
5. Ensure tests pass on all browsers

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
