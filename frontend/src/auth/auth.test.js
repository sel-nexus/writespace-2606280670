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

  it('rejects invalid input types and handles excessively large registration values', () => {
    expect(login(null, {})).toEqual({ ok: false, error: 'Invalid username or password.' });
    expect(register({ displayName: {}, username: 42, password: null, confirmPassword: [] }).ok).toBe(false);
    const oversized = 'x'.repeat(100_000);
    const result = register({ displayName: oversized, username: 'large-user', password: 'secret', confirmPassword: 'secret' });
    expect(result.ok).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(USERS_KEY))[0].displayName).toBe(oversized);
  });

  it('handles storage write failures for admin and user login and registration writes', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(login('admin', 'admin').ok).toBe(false);
    setItem.mockRestore();

    register({ displayName: 'Rae', username: 'rae', password: 'secret', confirmPassword: 'secret' });
    window.localStorage.removeItem('writespace_session');
    const userLoginSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(login('rae', 'secret').ok).toBe(false);
    userLoginSetItem.mockRestore();

    const accountWrite = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(register({ displayName: 'Kai', username: 'kai', password: 'secret', confirmPassword: 'secret' }).ok).toBe(false);
    accountWrite.mockRestore();

    const sessionWrite = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      if (key === 'writespace_session') throw new Error('blocked');
      return Storage.prototype.setItem.wrappedMethod.call(window.localStorage, key, value);
    });
    expect(register({ displayName: 'Mira', username: 'mira', password: 'secret', confirmPassword: 'secret' }).ok).toBe(false);
    sessionWrite.mockRestore();
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
