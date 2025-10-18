import { test as base, expect, Page } from '@playwright/test';

/**
 * Page Object Model - Dashboard Navigation
 */
export class DashboardPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToTab(tab: 'home' | 'deploy' | 'wallet' | 'vesting' | 'oracles' | 'settings') {
    await this.page.getByRole('button', { name: tab, exact: true }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectTabActive(tab: string) {
    const button = this.page.getByRole('button', { name: tab, exact: true });
    await expect(button).toHaveClass(/border-indigo-600/);
  }

  async getTenderlyDashboardLink() {
    return this.page.getByRole('link', { name: /Open Dashboard/ });
  }
}

/**
 * Page Object Model - Vesting Schedule Builder
 */
export class VestingBuilderPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Vesting' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Preset Selection
  async selectPreset(preset: '60-Month Linear' | '4-Year with 1-Year Cliff' | 'Custom Schedule') {
    await this.page.getByRole('button', { name: preset }).click();
  }

  async getActivePreset() {
    return this.page.locator('.border-indigo-600').first();
  }

  // Mode Selection
  async selectMode(mode: 'Test Mode' | 'Production Mode') {
    await this.page.getByRole('button', { name: mode }).click();
  }

  async getActiveMode() {
    return this.page.locator('button:has-text("Test Mode"), button:has-text("Production Mode")').filter({ hasText: /border-(green|blue)-600/ });
  }

  // Parameters
  async setTotalAmount(amount: string) {
    const input = this.page.getByLabel(/Total Amount/);
    await input.clear();
    await input.fill(amount);
  }

  async setStartDate(dateTime: string) {
    const input = this.page.getByLabel(/Start Date/);
    await input.fill(dateTime);
  }

  async setCliffMonths(months: number) {
    const input = this.page.getByLabel(/Cliff Period/);
    await input.clear();
    await input.fill(months.toString());
  }

  async setVestingMonths(months: number) {
    const input = this.page.getByLabel(/Total Vesting Period/);
    await input.clear();
    await input.fill(months.toString());
  }

  // Recipients
  async addRecipient() {
    await this.page.getByRole('button', { name: '+ Add Recipient' }).click();
  }

  async setRecipientAddress(index: number, address: string) {
    const inputs = this.page.locator('input[placeholder*="0x"]');
    await inputs.nth(index).fill(address);
  }

  async setRecipientPercentage(index: number, percentage: number) {
    const inputs = this.page.locator('input[placeholder="%"]');
    await inputs.nth(index).fill(percentage.toString());
  }

  async toggleRecipientVault(index: number) {
    const checkboxes = this.page.locator('input[type="checkbox"]');
    await checkboxes.nth(index).click();
  }

  async removeRecipient(index: number) {
    const removeButtons = this.page.locator('button:has-text("✕")');
    await removeButtons.nth(index).click();
  }

  async getTotalAllocation() {
    return this.page.locator('text=/Total Allocation:/').locator('..').locator('span').last();
  }

  // Import/Export
  async exportToFile() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: /Export File/ }).click();
    const download = await downloadPromise;
    return download;
  }

  async copyToClipboard() {
    await this.page.getByRole('button', { name: /Copy/ }).click();
  }

  async pasteFromClipboard() {
    await this.page.getByRole('button', { name: /Paste/ }).click();
  }

  async importFromFile(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: /Import File/ }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  // Validation
  async expectPastDueWarning() {
    await expect(this.page.getByText(/Start Date is in the Past/)).toBeVisible();
  }

  async expectNoPastDueWarning() {
    await expect(this.page.getByText(/Start Date is in the Past/)).not.toBeVisible();
  }

  async expectValidAllocation() {
    const allocation = await this.getTotalAllocation();
    await expect(allocation).toContainText('100.0%');
    await expect(allocation).toHaveClass(/text-green-600/);
  }

  async expectInvalidAllocation() {
    const allocation = await this.getTotalAllocation();
    await expect(allocation).toHaveClass(/text-red-600/);
  }

  // Summary
  async getVestingSummary() {
    return this.page.locator('.bg-indigo-50').last();
  }

  async expectSummaryContains(text: string) {
    const summary = await this.getVestingSummary();
    await expect(summary).toContainText(text);
  }
}

/**
 * Page Object Model - Deploy Tab
 */
export class DeployPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Deploy' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getContractCard(contractName: string) {
    return this.page.locator('.bg-white').filter({ hasText: contractName });
  }

  async expectContractStatus(contractName: string, status: string) {
    const card = await this.getContractCard(contractName);
    await expect(card).toContainText(status);
  }
}

/**
 * Test Fixtures with Page Object Models
 */
export const test = base.extend<{
  dashboardPage: DashboardPage;
  vestingBuilder: VestingBuilderPage;
  deployPage: DeployPage;
}>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  vestingBuilder: async ({ page }, use) => {
    const vestingBuilder = new VestingBuilderPage(page);
    await use(vestingBuilder);
  },

  deployPage: async ({ page }, use) => {
    const deployPage = new DeployPage(page);
    await use(deployPage);
  },
});

export { expect };
