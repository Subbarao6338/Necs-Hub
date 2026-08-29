import { test, expect } from '@playwright/test';

test('app loads and shows title', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/Epic Toolbox/);

  // Checks that the app title is displayed in either mobile header or desktop sidebar
  const titleLocator = page.locator('h1.page-title, h1.sidebar-title').filter({ visible: true });
  await expect(titleLocator).toContainText('NECS Bookmarks');
});

test('can open settings modal and see live analytics and diagnostics', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Click the settings button in either the mobile tab bar or the desktop sidebar
  const settingsButton = page.locator('button:has-text("Settings"), button[title="Settings"]').filter({ visible: true }).first();
  await settingsButton.click();

  // Verify settings modal is open
  await expect(page.locator('.modal h2')).toContainText('Settings');

  // Verify live analytics and system diagnostics collapsible sections exist in settings
  await expect(page.locator('.modal')).toContainText('Live Analytics');
  await expect(page.locator('.modal')).toContainText('System Diagnostics');
});

test('verify analytics tab is removed from navigation', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Ensure Analytics tab button does not exist in navigation
  const analyticsNav = page.locator('button:has-text("Analytics")').filter({ visible: true });
  await expect(analyticsNav).toHaveCount(0);
});

test('filters bookmarks via category hash navigation', async ({ page }) => {
  await page.goto('http://localhost:5173/#Streaming');
  // Check that Streaming category is active and shown
  await expect(page.locator('.main-category-nav .pill.active')).toContainText('Streaming');
  await expect(page.locator('.category-title')).toContainText('Streaming');

  // Test category link click on a bookmark card tag
  await page.goto('http://localhost:5173/#All');
  const catLink = page.locator('a.category-tag-link[href="#Streaming"]').first();
  await catLink.click();
  await expect(page.locator('.main-category-nav .pill.active')).toContainText('Streaming');
});
