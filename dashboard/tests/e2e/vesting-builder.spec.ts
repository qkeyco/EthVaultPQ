import { test, expect } from './helpers/fixtures';
import { TEST_ADDRESSES, TEST_VESTING_SCHEDULES, getFutureDateTimeString, getPastDateTimeString } from './helpers/test-data';

test.describe('Vesting Schedule Builder', () => {
  test('should load vesting builder with default values', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Check preset selection is visible
    await expect(vestingBuilder.page.getByText(/Vesting Schedule Preset/)).toBeVisible();

    // Check default preset (60-month linear)
    const activePreset = await vestingBuilder.getActivePreset();
    await expect(activePreset).toContainText('60-Month Linear');

    // Check default mode (test)
    await expect(vestingBuilder.page.getByRole('button', { name: 'Test Mode' })).toHaveClass(/border-green-600/);

    // Check default start date is 1 minute in future (no past-due warning)
    await vestingBuilder.expectNoPastDueWarning();
  });

  test('should switch between presets', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Switch to 4-year cliff
    await vestingBuilder.selectPreset('4-Year with 1-Year Cliff');
    const activePreset = await vestingBuilder.getActivePreset();
    await expect(activePreset).toContainText('4-Year with 1-Year Cliff');

    // Check summary updates
    await vestingBuilder.expectSummaryContains('12 months');
    await vestingBuilder.expectSummaryContains('48 months');

    // Switch to custom
    await vestingBuilder.selectPreset('Custom Schedule');
    await expect(vestingBuilder.page.getByLabel(/Cliff Period/)).toBeVisible();
    await expect(vestingBuilder.page.getByLabel(/Total Vesting Period/)).toBeVisible();
  });

  test('should switch between test and production mode', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Start in test mode
    await expect(vestingBuilder.page.getByRole('button', { name: 'Test Mode' })).toHaveClass(/border-green-600/);
    await vestingBuilder.expectSummaryContains('Test (1 min = 1 month)');

    // Switch to production
    await vestingBuilder.selectMode('Production Mode');
    await expect(vestingBuilder.page.getByRole('button', { name: 'Production Mode' })).toHaveClass(/border-blue-600/);
    await vestingBuilder.expectSummaryContains('Production');
  });

  test('should update total amount', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    await vestingBuilder.setTotalAmount('5000000');
    await vestingBuilder.expectSummaryContains('5000000 MUSDC');
  });

  test('should set custom cliff and vesting periods', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    await vestingBuilder.selectPreset('Custom Schedule');
    await vestingBuilder.setCliffMonths(6);
    await vestingBuilder.setVestingMonths(24);

    await vestingBuilder.expectSummaryContains('6 months');
    await vestingBuilder.expectSummaryContains('24 months');
  });

  test('should show past-due warning for past start dates', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Set start date to 2 months ago
    const pastDate = getPastDateTimeString(2);
    await vestingBuilder.setStartDate(pastDate);

    // Should show warning
    await vestingBuilder.expectPastDueWarning();
    await expect(vestingBuilder.page.getByText(/months have passed/)).toBeVisible();
  });

  test('should not show past-due warning for future start dates', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Set start date to future
    const futureDate = getFutureDateTimeString(60);
    await vestingBuilder.setStartDate(futureDate);

    // Should not show warning
    await vestingBuilder.expectNoPastDueWarning();
  });
});

test.describe('Vesting Recipients', () => {
  test('should start with one default recipient', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Check total allocation is 100%
    await vestingBuilder.expectValidAllocation();
  });

  test('should add multiple recipients', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Add two more recipients
    await vestingBuilder.addRecipient();
    await vestingBuilder.addRecipient();

    // Set addresses and percentages
    await vestingBuilder.setRecipientAddress(0, TEST_ADDRESSES.VALID_WALLET_1);
    await vestingBuilder.setRecipientPercentage(0, 50);

    await vestingBuilder.setRecipientAddress(1, TEST_ADDRESSES.VALID_WALLET_2);
    await vestingBuilder.setRecipientPercentage(1, 30);

    await vestingBuilder.setRecipientAddress(2, TEST_ADDRESSES.VALID_WALLET_3);
    await vestingBuilder.setRecipientPercentage(2, 20);

    // Check total allocation
    await vestingBuilder.expectValidAllocation();
    const allocation = await vestingBuilder.getTotalAllocation();
    await expect(allocation).toContainText('100.0%');
  });

  test('should validate recipient percentages', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Set invalid percentage
    await vestingBuilder.setRecipientPercentage(0, 50);

    // Should show error
    await vestingBuilder.expectInvalidAllocation();
    const allocation = await vestingBuilder.getTotalAllocation();
    await expect(allocation).toContainText('50.0%');
    await expect(allocation).toContainText('(must equal 100%)');
  });

  test('should toggle vault checkbox', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    await vestingBuilder.setRecipientAddress(0, TEST_ADDRESSES.VALID_VAULT_1);
    await vestingBuilder.toggleRecipientVault(0);

    // Checkbox should be checked
    const checkbox = vestingBuilder.page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeChecked();
  });

  test('should remove recipients', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Add second recipient
    await vestingBuilder.addRecipient();

    // Remove first recipient
    await vestingBuilder.removeRecipient(0);

    // Should have only one recipient left
    const removeButtons = vestingBuilder.page.locator('button:has-text("✕")');
    await expect(removeButtons).toHaveCount(0); // Can't remove the last recipient
  });

  test('should configure multi-recipient vesting', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    const schedule = TEST_VESTING_SCHEDULES.MULTI_RECIPIENT;

    // Set basic parameters
    await vestingBuilder.selectPreset(schedule.preset as any);
    await vestingBuilder.selectMode(schedule.mode as any);
    await vestingBuilder.setTotalAmount(schedule.totalAmount);

    // Add recipients
    await vestingBuilder.addRecipient();
    await vestingBuilder.addRecipient();

    // Configure first recipient
    await vestingBuilder.setRecipientAddress(0, schedule.recipients[0].address);
    await vestingBuilder.setRecipientPercentage(0, schedule.recipients[0].percentage);

    // Configure second recipient
    await vestingBuilder.setRecipientAddress(1, schedule.recipients[1].address);
    await vestingBuilder.setRecipientPercentage(1, schedule.recipients[1].percentage);

    // Configure third recipient (vault)
    await vestingBuilder.setRecipientAddress(2, schedule.recipients[2].address);
    await vestingBuilder.setRecipientPercentage(2, schedule.recipients[2].percentage);
    await vestingBuilder.toggleRecipientVault(2);

    // Verify allocation
    await vestingBuilder.expectValidAllocation();
  });
});

test.describe('Vesting Summary', () => {
  test('should display correct summary for 60-month linear', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    await vestingBuilder.selectPreset('60-Month Linear');
    await vestingBuilder.selectMode('Test Mode');
    await vestingBuilder.setTotalAmount('1000000');

    const summary = await vestingBuilder.getVestingSummary();
    await expect(summary).toContainText('Test (1 min = 1 month)');
    await expect(summary).toContainText('1000000 MUSDC');
    await expect(summary).toContainText('0 months');
    await expect(summary).toContainText('60 months');
  });

  test('should display correct summary for 4-year cliff', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    await vestingBuilder.selectPreset('4-Year with 1-Year Cliff');
    await vestingBuilder.selectMode('Production Mode');
    await vestingBuilder.setTotalAmount('5000000');

    const summary = await vestingBuilder.getVestingSummary();
    await expect(summary).toContainText('Production');
    await expect(summary).toContainText('5000000 MUSDC');
    await expect(summary).toContainText('12 months');
    await expect(summary).toContainText('48 months');
  });

  test('should update summary in real-time', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Change amount
    await vestingBuilder.setTotalAmount('2500000');
    await vestingBuilder.expectSummaryContains('2500000 MUSDC');

    // Change preset
    await vestingBuilder.selectPreset('4-Year with 1-Year Cliff');
    await vestingBuilder.expectSummaryContains('12 months');

    // Change mode
    await vestingBuilder.selectMode('Production Mode');
    await vestingBuilder.expectSummaryContains('Production');
  });
});

test.describe('Import/Export Controls', () => {
  test('should display import/export toolbar', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    await expect(vestingBuilder.page.getByText(/Import\/Export Schedule/)).toBeVisible();
    await expect(vestingBuilder.page.getByRole('button', { name: /Import File/ })).toBeVisible();
    await expect(vestingBuilder.page.getByRole('button', { name: /Paste/ })).toBeVisible();
    await expect(vestingBuilder.page.getByRole('button', { name: /Copy/ })).toBeVisible();
    await expect(vestingBuilder.page.getByRole('button', { name: /Export File/ })).toBeVisible();
  });
});
