import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_USER, getSession, homeForSession, login, logout, readStoredArray, register, USERS_KEY } from './auth.js';

beforeEach(() => {
  window.localStorage.clear();
});

describe('local identity helpers', () => {
  it('authenticates the built-in admin and persists an admin session', () => {
    const result = login('admin', 'admin');
    expect(result.ok).toBe(true);
    expect(result.session).toMatchObject({ userId: ADMIN_USER.userId, role: 'admin' });
    expect(getSession()).toEqual(result.session);
    expect(homeForSession(result.session)).toBe('/admin');
  });

  it('rejects invalid credentials with the specified message', () => {
    expect(login('admin', 'wrong')).toEqual({ ok: false, error: 'Invalid username or password.' });
    expect(getSession()).toBeNull();
  });

  it('registers a user, persists the account and session, and logs in after reload', () => {
    const result = register({ displayName: 'Rae Writer', username: 'rae', password: 'secret', confirmPassword: 'secret' });
    expect(result.ok).toBe(true);
    expect(result.session.role).toBe('user');
    expect(JSON.parse(window.localStorage.getItem(USERS_KEY))).toHaveLength(1);
    expect(homeForSession(result.session)).toBe('/blogs');
    window.localStorage.removeItem('writespace_session');
    expect(login('rae', 'secret').ok).toBe(true);
  });

  it('rejects missing fields, mismatched passwords, and the reserved admin username', () => {
    expect(register({ displayName: '', username: '', password: '', confirmPassword: '' }).errors).toMatchObject({
      displayName: 'Display name is required.',
      username: 'Username is required.',
      password: 'Password is required.',
      confirmPassword: 'Please confirm your password.',
    });
    expect(register({ displayName: 'Rae', username: 'rae', password: 'one', confirmPassword: 'two' }).errors.confirmPassword).toBe('Passwords do not match.');
    expect(register({ displayName: 'Admin', username: 'ADMIN', password: 'one', confirmPassword: 'one' }).errors.username).toBe('That username is already taken.');
  });

  it('rejects duplicate usernames case-insensitively', () => {
    register({ displayName: 'Rae', username: 'rae', password: 'secret', confirmPassword: 'secret' });
    expect(register({ displayName: 'Another Rae', username: 'RAE', password: 'secret', confirmPassword: 'secret' }).errors.username).toBe('That username is already taken.');
  });

  it('returns an empty array for malformed or unavailable local storage', () => {
    window.localStorage.setItem(USERS_KEY, '{broken');
    expect(readStoredArray(USERS_KEY)).toEqual([]);
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(readStoredArray(USERS_KEY)).toEqual([]);
    getItem.mockRestore();
  });

  it('clears the session and rejects malformed session data', () => {
    window.localStorage.setItem('writespace_session', '{broken');
    expect(getSession()).toBeNull();
    login('admin', 'admin');
    expect(logout()).toBe(true);
    expect(getSession()).toBeNull();
  });
});
