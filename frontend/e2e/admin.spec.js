import { expect, test } from '@playwright/test';

const watchBrowserErrors = (page) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  return browserErrors;
};

test('admin manages accounts and reviews recent posts', async ({ page }) => {
  const browserErrors = watchBrowserErrors(page);
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
  await expect(page.getByText('@rae')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/writespace-users-mobile.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});

test('admin edits and deletes a post after confirming the destructive action', async ({ page }) => {
  const browserErrors = watchBrowserErrors(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Admin Test Author');
  await page.getByLabel('Username').fill('admintestauthor');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await page.getByRole('link', { name: 'Write a Post' }).first().click();
  await page.getByLabel('Title').fill('Admin moderation target');
  await page.getByLabel('Content').fill('Original moderation content.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page).toHaveURL(/\/blog\//);
  const postUrl = page.url();

  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).first().click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'All Blogs' }).click();
  await page.getByRole('link', { name: 'Admin moderation target', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Admin moderation target' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByLabel('Content').fill('Updated by the administrator.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Updated by the administrator.')).toBeVisible();

  let confirmationMessage = '';
  page.once('dialog', async (dialog) => {
    confirmationMessage = dialog.message();
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  expect(confirmationMessage).toMatch(/delete/i);
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('Admin moderation target')).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});
