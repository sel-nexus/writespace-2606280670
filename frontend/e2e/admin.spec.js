import { expect, test } from '@playwright/test';

test('admin manages accounts and reviews recent posts', async ({ page }) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).first().click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('Total Posts')).toBeVisible();
  await page.getByRole('link', { name: 'Manage Users' }).click();
  await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Default admin cannot be deleted' })).toBeDisabled();
  await page.getByLabel('Display Name').fill('Rae Writer');
  await page.getByLabel('Username').fill('rae');
  await page.getByLabel('Password').fill('secret');
  await page.getByLabel('Role').selectOption('user');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByRole('status')).toHaveText('Rae Writer was added.');
  await expect(page.getByText('@rae')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/writespace-users-mobile.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});
