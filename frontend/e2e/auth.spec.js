import { expect, test } from '@playwright/test';

test('guest can register, retain a session, and reach the writer workspace', async ({ page }) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/');
  await page.screenshot({ path: 'test-results/writespace-landing.png', fullPage: true });
  await expect(page.getByRole('heading', { name: 'Your thoughts. Your space.' })).toBeVisible();
  await expect(page.getByText('No posts yet - check back soon!')).toBeVisible();
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Rae Writer');
  await page.getByLabel('Username').fill('rae');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await page.reload();
  await expect(page).toHaveURL(/\/blogs$/);
  expect(browserErrors).toEqual([]);
});

test('admin can sign in and guests are redirected from protected routes', async ({ page }) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/blogs');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
  await page.screenshot({ path: 'test-results/writespace-mobile-menu.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});
