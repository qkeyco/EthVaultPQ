import { test, expect } from './helpers/fixtures';

test.describe('Dashboard Navigation', () => {
  test('should load the dashboard homepage', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Check title
    await expect(dashboardPage.page).toHaveTitle(/EthVaultPQ/);

    // Check header
    await expect(dashboardPage.page.getByRole('heading', { name: /EthVaultPQ/ })).toBeVisible();
    await expect(dashboardPage.page.getByText(/Post-Quantum Ethereum Protocol/)).toBeVisible();
  });

  test('should have all navigation tabs', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Check all tabs are present
    await expect(dashboardPage.page.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
    await expect(dashboardPage.page.getByRole('button', { name: 'Deploy' })).toBeVisible();
    await expect(dashboardPage.page.getByRole('button', { name: 'Wallets' })).toBeVisible();
    await expect(dashboardPage.page.getByRole('button', { name: 'Vesting' })).toBeVisible();
    await expect(dashboardPage.page.getByRole('button', { name: 'Oracles' })).toBeVisible();
    await expect(dashboardPage.page.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  test('should navigate to Deploy tab', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.navigateToTab('deploy');

    // Check Deploy tab is active
    await dashboardPage.expectTabActive('Deploy');

    // Check deploy content is visible
    await expect(dashboardPage.page.getByText(/Contract Deployment/)).toBeVisible();
  });

  test('should navigate to Vesting tab', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.navigateToTab('vesting');

    // Check Vesting tab is active
    await dashboardPage.expectTabActive('Vesting');

    // Check vesting content is visible
    await expect(dashboardPage.page.getByText(/Vesting Schedule Preset/)).toBeVisible();
  });

  test('should navigate to Wallets tab', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.navigateToTab('wallet');

    // Check Wallets tab is active
    await dashboardPage.expectTabActive('Wallets');
  });

  test('should navigate between tabs', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // Navigate through multiple tabs
    await dashboardPage.navigateToTab('deploy');
    await dashboardPage.expectTabActive('Deploy');

    await dashboardPage.navigateToTab('vesting');
    await dashboardPage.expectTabActive('Vesting');

    await dashboardPage.navigateToTab('home');
    await dashboardPage.expectTabActive('Home');
  });

  test('should display Tenderly dashboard link on home page', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    const tenderlyLink = await dashboardPage.getTenderlyDashboardLink();
    await expect(tenderlyLink).toBeVisible();
    await expect(tenderlyLink).toHaveAttribute('href', /tenderly\.co/);
    await expect(tenderlyLink).toHaveAttribute('target', '_blank');
  });

  test('should show footer with protocol info', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.page.getByText(/Built with ERC-4337/)).toBeVisible();
    await expect(dashboardPage.page.getByText(/WARNING: Testnet version/)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check content is still visible
    await expect(page.getByRole('heading', { name: /EthVaultPQ/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
  });
});

test.describe('Home Page Content', () => {
  test('should display welcome message and stats', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.page.getByText(/Welcome to EthVaultPQ/)).toBeVisible();
    await expect(dashboardPage.page.getByText(/first post-quantum secure smart contract protocol/)).toBeVisible();

    // Check stats cards
    await expect(dashboardPage.page.getByText(/Contracts/).locator('..')).toContainText('8');
    await expect(dashboardPage.page.getByText(/Network/).locator('..')).toContainText('Tenderly');
    await expect(dashboardPage.page.getByText(/Status/).locator('..')).toContainText('Testnet');
  });

  test('should display Tenderly network info card', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.page.getByText(/Tenderly Virtual TestNet/)).toBeVisible();
    await expect(dashboardPage.page.getByText(/Monitor transactions and debug contracts/)).toBeVisible();
  });
});
