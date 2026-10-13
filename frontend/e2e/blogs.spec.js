import { expect, test } from '@playwright/test';

const watchBrowserErrors = (page) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  return browserErrors;
};

async function registerWriter(page, displayName, username) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill(displayName);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
}

test('writer creates, reads, edits, and deletes a post with local persistence', async ({ page }) => {
  const browserErrors = watchBrowserErrors(page);
  await registerWriter(page, 'Rae Writer', 'rae');
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.getByRole('link', { name: 'Write a Post' }).first().click();
  await page.getByLabel('Title').fill('A note from the garden');
  await page.getByLabel('Content').fill('The first warm morning arrived today.');
  await expect(page.getByText('37 characters')).toBeVisible();
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page).toHaveURL(/\/blog\//);
  await expect(page.getByRole('heading', { name: 'A note from the garden' })).toBeVisible();
  await expect(page.getByText('The first warm morning arrived today.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('The first warm morning arrived today.')).toBeVisible();
  await page.getByRole('link', { name: 'All Blogs' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('A note from the garden')).toBeVisible();
  await page.getByRole('link', { name: 'A note from the garden', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\//);
  await expect(page.getByText('The first warm morning arrived today.')).toBeVisible();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByLabel('Content').fill('The first warm morning arrived today. The garden is waking up.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('The garden is waking up.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('The garden is waking up.')).toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/writespace-blog-mobile.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});

test('guest sees a populated latest-post preview and is redirected when opening it', async ({ page }) => {
  const browserErrors = watchBrowserErrors(page);
  await registerWriter(page, 'Preview Writer', 'previewwriter');
  await page.getByRole('link', { name: 'Write a Post' }).first().click();
  await page.getByLabel('Title').fill('Latest preview story');
  await page.getByLabel('Content').fill('A preview of the newest story.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page).toHaveURL(/\/blog\//);
  await page.getByRole('link', { name: /Home|WriteSpace/i }).first().click();
  await expect(page.getByText('Latest preview story')).toBeVisible();
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await page.getByText('Latest preview story').click();
  await expect(page).toHaveURL(/\/login$/);
  expect(browserErrors).toEqual([]);
});

test('a writer cannot edit or delete another writer’s post', async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  const ownerErrors = watchBrowserErrors(ownerPage);
  await registerWriter(ownerPage, 'Post Owner', 'postowner');
  await ownerPage.getByRole('link', { name: 'Write a Post' }).first().click();
  await ownerPage.getByLabel('Title').fill('Owner-only post');
  await ownerPage.getByLabel('Content').fill('This post belongs to its author.');
  await ownerPage.getByRole('button', { name: 'Publish Post' }).click();
  await expect(ownerPage).toHaveURL(/\/blog\//);
  await ownerPage.getByRole('link', { name: /Home|WriteSpace/i }).first().click();
  await expect(ownerPage).toHaveURL('/');
  await ownerPage.getByText('Owner-only post').click();
  await expect(ownerPage).toHaveURL(/\/blog\//);
  const postUrl = ownerPage.url();

  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  const userErrors = watchBrowserErrors(userPage);
  await registerWriter(userPage, 'Regular Reader', 'regularreader');
  await userPage.evaluate((post) => {
    const posts = JSON.parse(localStorage.getItem('writespace_posts') || '[]');
    localStorage.setItem('writespace_posts', JSON.stringify([...posts, post]));
  }, JSON.parse(await ownerPage.evaluate(() => localStorage.getItem('writespace_posts')))[0]);
  await userPage.getByRole('link', { name: /Home|WriteSpace/i }).first().click();
  await userPage.getByRole('button', { name: 'Account menu' }).click();
  await userPage.getByRole('button', { name: 'Logout' }).click();
  await userPage.getByRole('link', { name: 'Login' }).first().click();
  await userPage.getByLabel('Username').fill('regularreader');
  await userPage.getByLabel('Password').fill('secret');
  await userPage.getByRole('button', { name: 'Login' }).click();
  await expect(userPage).toHaveURL(/\/blogs$/);
  await userPage.getByRole('link', { name: 'All Blogs' }).first().click();
  await userPage.getByRole('link', { name: 'Owner-only post', exact: true }).click();
  await expect(userPage).toHaveURL(/\/blog\//);
  await expect(userPage.getByRole('heading', { name: 'Owner-only post' })).toBeVisible();
  await expect(userPage.getByRole('link', { name: 'Edit' })).toHaveCount(0);
  await expect(userPage.getByRole('button', { name: 'Delete' })).toHaveCount(0);

  expect(ownerErrors).toEqual([]);
  expect(userErrors).toEqual([]);
  await ownerContext.close();
  await userContext.close();
});


