import { test, expect } from './helpers/fixtures';
import { SAMPLE_JSON_SCHEDULE, TEST_ADDRESSES } from './helpers/test-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Vesting Import/Export', () => {
  const testJsonPath = path.join(__dirname, '../../templates/vesting-test-5minute.json');
  const linearJsonPath = path.join(__dirname, '../../templates/vesting-60month-linear.json');
  const multiRecipientPath = path.join(__dirname, '../../templates/vesting-multi-recipient.json');

  test('should export schedule to JSON file', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Configure a schedule
    await vestingBuilder.selectPreset('60-Month Linear');
    await vestingBuilder.selectMode('Test Mode');
    await vestingBuilder.setTotalAmount('1000000');
    await vestingBuilder.setRecipientAddress(0, TEST_ADDRESSES.VALID_WALLET_1);

    // Export
    const download = await vestingBuilder.exportToFile();

    // Verify download
    expect(download.suggestedFilename()).toMatch(/vesting-schedule-.*\.json/);

    // Save and verify file content
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();

    if (downloadPath) {
      const content = fs.readFileSync(downloadPath, 'utf-8');
      const json = JSON.parse(content);

      expect(json.version).toBe('1.0.0');
      expect(json.schedule.preset).toBe('60-month-linear');
      expect(json.schedule.mode).toBe('test');
      expect(json.schedule.totalAmount).toBe('1000000');
      expect(json.recipients).toHaveLength(1);
      expect(json.recipients[0].percentage).toBe(100);
    }
  });

  test('should import schedule from JSON file', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    // Verify test template exists
    expect(fs.existsSync(testJsonPath)).toBe(true);

    // Import the test template
    await vestingBuilder.importFromFile(testJsonPath);

    // Wait for import to complete
    await vestingBuilder.page.waitForTimeout(500);

    // Verify the schedule was imported
    const activePreset = await vestingBuilder.getActivePreset();
    await expect(activePreset).toContainText('Custom Schedule');

    const activeMode = vestingBuilder.page.getByRole('button', { name: 'Test Mode' });
    await expect(activeMode).toHaveClass(/border-green-600/);
  });

  test('should import 60-month linear template', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    expect(fs.existsSync(linearJsonPath)).toBe(true);

    await vestingBuilder.importFromFile(linearJsonPath);
    await vestingBuilder.page.waitForTimeout(500);

    const activePreset = await vestingBuilder.getActivePreset();
    await expect(activePreset).toContainText('60-Month Linear');

    await vestingBuilder.expectSummaryContains('1000000');
    await vestingBuilder.expectSummaryContains('60 months');
  });

  test('should import multi-recipient template', async ({ vestingBuilder }) => {
    await vestingBuilder.goto();

    expect(fs.existsSync(multiRecipientPath)).toBe(true);

    await vestingBuilder.importFromFile(multiRecipientPath);
    await vestingBuilder.page.waitForTimeout(500);

    // Should have 4 recipients
    const addressInputs = vestingBuilder.page.locator('input[placeholder*="0x"]');
    await expect(addressInputs).toHaveCount(4);

    // Check allocation is valid
    await vestingBuilder.expectValidAllocation();
  });

  test('should copy schedule to clipboard', async ({ vestingBuilder, page }) => {
    await vestingBuilder.goto();

    // Configure a simple schedule
    await vestingBuilder.selectPreset('60-Month Linear');
    await vestingBuilder.setTotalAmount('500000');

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Copy to clipboard
    await vestingBuilder.copyToClipboard();

    // Wait for alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('copied to clipboard');
      await dialog.accept();
    });

    await vestingBuilder.page.waitForTimeout(500);

    // Verify clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBeTruthy();

    const json = JSON.parse(clipboardContent);
    expect(json.version).toBe('1.0.0');
    expect(json.schedule.totalAmount).toBe('500000');
  });

  test('should paste schedule from clipboard', async ({ vestingBuilder, page }) => {
    await vestingBuilder.goto();

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Create a JSON schedule and write to clipboard
    const jsonSchedule = JSON.stringify(SAMPLE_JSON_SCHEDULE);
    await page.evaluate((json) => {
      navigator.clipboard.writeText(json);
    }, jsonSchedule);

    // Handle the success alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('imported from clipboard');
      await dialog.accept();
    });

    // Paste from clipboard
    await vestingBuilder.pasteFromClipboard();
    await vestingBuilder.page.waitForTimeout(500);

    // Verify the schedule was imported
    await vestingBuilder.expectSummaryContains('500000');
  });

  test('should validate imported JSON structure', async ({ vestingBuilder, page }) => {
    await vestingBuilder.goto();

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Invalid JSON
    const invalidJson = '{ "invalid": "structure" }';
    await page.evaluate((json) => {
      navigator.clipboard.writeText(json);
    }, invalidJson);

    // Handle error alert
    let errorShown = false;
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Failed to paste');
      errorShown = true;
      await dialog.accept();
    });

    await vestingBuilder.pasteFromClipboard();
    await vestingBuilder.page.waitForTimeout(500);

    expect(errorShown).toBe(true);
  });

  test('should validate recipient percentages on import', async ({ vestingBuilder, page }) => {
    await vestingBuilder.goto();

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Create invalid schedule (percentages don't sum to 100)
    const invalidSchedule = {
      ...SAMPLE_JSON_SCHEDULE,
      recipients: [
        {
          address: TEST_ADDRESSES.VALID_WALLET_1,
          percentage: 50,
          amount: '250000.00',
          isVault: false,
        },
        {
          address: TEST_ADDRESSES.VALID_WALLET_2,
          percentage: 30, // Only 80% total
          amount: '150000.00',
          isVault: false,
        },
      ],
    };

    const jsonSchedule = JSON.stringify(invalidSchedule);
    await page.evaluate((json) => {
      navigator.clipboard.writeText(json);
    }, jsonSchedule);

    // Handle error alert
    let errorShown = false;
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('must sum to exactly 100%');
      errorShown = true;
      await dialog.accept();
    });

    await vestingBuilder.pasteFromClipboard();
    await vestingBuilder.page.waitForTimeout(500);

    expect(errorShown).toBe(true);
  });

  test('should round-trip export and import', async ({ vestingBuilder, page }) => {
    await vestingBuilder.goto();

    // Configure a complex schedule
    await vestingBuilder.selectPreset('4-Year with 1-Year Cliff');
    await vestingBuilder.selectMode('Production Mode');
    await vestingBuilder.setTotalAmount('7500000');

    await vestingBuilder.addRecipient();
    await vestingBuilder.setRecipientAddress(0, TEST_ADDRESSES.VALID_WALLET_1);
    await vestingBuilder.setRecipientPercentage(0, 60);
    await vestingBuilder.setRecipientAddress(1, TEST_ADDRESSES.VALID_WALLET_2);
    await vestingBuilder.setRecipientPercentage(1, 40);

    // Export
    const download = await vestingBuilder.exportToFile();
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();

    if (downloadPath) {
      // Change the schedule
      await vestingBuilder.selectPreset('60-Month Linear');
      await vestingBuilder.setTotalAmount('1000000');

      // Re-import the original
      await vestingBuilder.importFromFile(downloadPath);
      await vestingBuilder.page.waitForTimeout(500);

      // Verify it matches the original
      const activePreset = await vestingBuilder.getActivePreset();
      await expect(activePreset).toContainText('4-Year with 1-Year Cliff');

      await vestingBuilder.expectSummaryContains('7500000');

      const addressInputs = vestingBuilder.page.locator('input[placeholder*="0x"]');
      await expect(addressInputs).toHaveCount(2);

      await vestingBuilder.expectValidAllocation();
    }
  });
});

test.describe('Template Library', () => {
  test('all template files should exist', () => {
    const templates = [
      'vesting-60month-linear.json',
      'vesting-4year-cliff.json',
      'vesting-test-5minute.json',
      'vesting-multi-recipient.json',
    ];

    for (const template of templates) {
      const templatePath = path.join(__dirname, '../../templates', template);
      expect(fs.existsSync(templatePath)).toBe(true);
    }
  });

  test('all templates should have valid JSON structure', () => {
    const templatesDir = path.join(__dirname, '../../templates');
    const templateFiles = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.json'));

    for (const file of templateFiles) {
      const filePath = path.join(templatesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(() => JSON.parse(content)).not.toThrow();

      const json = JSON.parse(content);
      expect(json.version).toBe('1.0.0');
      expect(json.metadata).toBeDefined();
      expect(json.deployment).toBeDefined();
      expect(json.schedule).toBeDefined();
      expect(json.recipients).toBeDefined();
      expect(json.security).toBeDefined();
    }
  });

  test('templates should have valid recipient allocations', () => {
    const templatesDir = path.join(__dirname, '../../templates');
    const templateFiles = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.json'));

    for (const file of templateFiles) {
      const filePath = path.join(templatesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);

      const totalPercentage = json.recipients.reduce(
        (sum: number, r: any) => sum + r.percentage,
        0
      );

      expect(totalPercentage).toBe(100);
    }
  });
});
