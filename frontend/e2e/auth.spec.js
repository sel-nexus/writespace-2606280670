import { expect, test } from '@playwright/test';

const watchBrowserErrors = (page) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  return browserErrors;
};

test('guest can register, retain a session, and reach the writer workspace', async ({ page }) => {
  const browserErrors = watchBrowserErrors(page);
  await page.goto('/');
  await page.screenshot({ path: 'test-results/writespace-landing.png', fullPage: true });
  await expect(page.getByRole('heading', { name: 'Your thoughts. Your space.' })).toBeVisible();
  await expect(page.getByText('—')).toBeVisible();
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Rae Writer');
  await page.getByLabel('Username').fill('rae');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('link', { name: 'Write a Post' }).first()).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('link', { name: 'Write a Post' }).first()).toBeVisible();
  await page.getByRole('link', { name: /Home|WriteSpace/i }).first().click();
  await expect(page).toHaveURL('/');
  expect(browserErrors).toEqual([]);
});

test('registration validates mismatched passwords and duplicate usernames', async ({ page }) => {
  const browserErrors = watchBrowserErrors(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Rae Writer');
  await page.getByLabel('Username').fill('rae');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('different');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Another Rae');
  await page.getByLabel('Username').fill('rae');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
  expect(browserErrors).toEqual([]);
});

test('admin can sign in and guests are redirected from protected routes', async ({ page }) => {
  const browserErrors = watchBrowserErrors(page);
  await page.goto('/blogs');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('link', { name: /Home|WriteSpace/i }).first().click();
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
  await page.screenshot({ path: 'test-results/writespace-mobile-menu.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});
