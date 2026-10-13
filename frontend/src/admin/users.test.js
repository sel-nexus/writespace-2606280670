import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_USER, USERS_KEY } from '../auth/auth.js';
import { createManagedUser, deleteManagedUser, getUserTotals, getUsers } from './users.js';

const admin = { userId: ADMIN_USER.userId, role: 'admin' };
const userSession = { userId: 'user-1', role: 'user' };

beforeEach(() => {
  window.localStorage.clear();
});

describe('administrator account operations', () => {
  it('includes the permanent admin and counts roles accurately', () => {
    window.localStorage.setItem(USERS_KEY, JSON.stringify([
      { userId: 'u1', username: 'rae', displayName: 'Rae', role: 'user' },
      { userId: 'a1', username: 'mira', displayName: 'Mira', role: 'admin' },
    ]));
    expect(getUsers()[0]).toEqual(ADMIN_USER);
    expect(getUserTotals()).toEqual({ total: 3, users: 1, admins: 2 });
  });

  it('creates accounts with either role and persists generated identity and timestamp', () => {
    const user = createManagedUser({ displayName: 'Rae Writer', username: 'rae', password: 'secret', role: 'user' });
    const secondAdmin = createManagedUser({ displayName: 'Mira Admin', username: 'mira', password: 'secret', role: 'admin' });
    expect(user.ok).toBe(true);
    expect(user.user.role).toBe('user');
    expect(user.user.userId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(Number.isNaN(Date.parse(user.user.createdAt))).toBe(false);
    expect(secondAdmin.user.role).toBe('admin');
    expect(JSON.parse(window.localStorage.getItem(USERS_KEY))).toHaveLength(2);
  });

  it('rejects missing fields, invalid roles, and duplicate usernames', () => {
    expect(createManagedUser({ displayName: '', username: '', password: '', role: 'owner' }).errors).toMatchObject({
      displayName: 'Display name is required.',
      username: 'Username is required.',
      password: 'Password is required.',
      role: 'Choose a valid role.',
    });
    createManagedUser({ displayName: 'Rae', username: 'rae', password: 'secret', role: 'user' });
    expect(createManagedUser({ displayName: 'Another Rae', username: 'RAE', password: 'secret', role: 'admin' }).errors.username).toBe('That username is already taken.');
    expect(createManagedUser({ displayName: 'Admin', username: 'admin', password: 'secret', role: 'user' }).errors.username).toBe('That username is already taken.');
  });

  it('rejects invalid input types and handles excessively large account values', () => {
    expect(createManagedUser(null).ok).toBe(false);
    expect(createManagedUser({ displayName: {}, username: 42, password: null, role: 'user' }).ok).toBe(false);
    const oversized = 'x'.repeat(100_000);
    const result = createManagedUser({ displayName: oversized, username: 'large-user', password: 'secret', role: 'user' });
    expect(result.ok).toBe(true);
    expect(result.user.displayName).toBe(oversized);
  });

  it('protects the default admin, current account, and non-admin sessions from deletion', () => {
    createManagedUser({ displayName: 'Rae', username: 'rae', password: 'secret', role: 'user' });
    const userId = JSON.parse(window.localStorage.getItem(USERS_KEY))[0].userId;
    expect(deleteManagedUser(ADMIN_USER.userId, admin).error).toBe('Default admin cannot be deleted.');
    expect(deleteManagedUser(userId, { userId, role: 'admin' }).error).toBe('You cannot delete your own account.');
    expect(deleteManagedUser(userId, userSession).error).toBe('Only administrators can manage accounts.');
    expect(deleteManagedUser(userId, null).error).toBe('Sign in as an administrator to manage accounts.');
    expect(JSON.parse(window.localStorage.getItem(USERS_KEY))).toHaveLength(1);
  });

  it('deletes an eligible account and verifies persisted state', () => {
    createManagedUser({ displayName: 'Rae', username: 'rae', password: 'secret', role: 'user' });
    const userId = JSON.parse(window.localStorage.getItem(USERS_KEY))[0].userId;
    expect(deleteManagedUser(userId, admin)).toEqual({ ok: true });
    expect(getUsers()).toEqual([ADMIN_USER]);
  });

  it('reports missing accounts and storage write failures', () => {
    expect(deleteManagedUser('missing', admin).error).toBe('Account not found.');
    const created = createManagedUser({ displayName: 'Rae', username: 'rae', password: 'secret', role: 'user' }).user;
    const before = window.localStorage.getItem(USERS_KEY);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(createManagedUser({ displayName: 'Kai', username: 'kai', password: 'secret', role: 'user' }).errors.form).toContain('Browser storage is unavailable');
    expect(deleteManagedUser(created.userId, admin).error).toContain('Browser storage is unavailable');
    expect(window.localStorage.getItem(USERS_KEY)).toBe(before);
    setItem.mockRestore();
  });
});
