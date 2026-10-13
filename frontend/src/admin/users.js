import { ADMIN_USER, USERS_KEY, readStoredArray, writeStoredValue } from '../auth/auth.js';

/** Return registered accounts with the permanent built-in administrator included.
 * @returns {Array<object>} All account records.
 */
export function getUsers() {
  return [ADMIN_USER, ...readStoredArray(USERS_KEY).filter(
    (user) => user && typeof user.userId === 'string' && typeof user.username === 'string' && typeof user.displayName === 'string',
  )];
}

/** Create an administrator-managed account after validating its fields and username.
 * @param {{displayName: string, username: string, password: string, role: string}} input Account fields.
 * @returns {{ok: boolean, user?: object, errors?: object}} Creation result.
 */
export function createManagedUser(input) {
  const displayName = typeof input?.displayName === 'string' ? input.displayName.trim() : '';
  const username = typeof input?.username === 'string' ? input.username.trim() : '';
  const password = typeof input?.password === 'string' ? input.password : '';
  const role = input?.role;
  const errors = {};
  if (!displayName) errors.displayName = 'Display name is required.';
  if (!username) errors.username = 'Username is required.';
  if (!password) errors.password = 'Password is required.';
  if (!['admin', 'user'].includes(role)) errors.role = 'Choose a valid role.';
  if (username && getUsers().some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    errors.username = 'That username is already taken.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const user = {
    userId: crypto.randomUUID(),
    displayName,
    username,
    password,
    role,
    createdAt: new Date().toISOString(),
  };
  const users = readStoredArray(USERS_KEY);
  if (!writeStoredValue(USERS_KEY, [...users, user])) {
    return { ok: false, errors: { form: 'Browser storage is unavailable. The account was not saved.' } };
  }
  return { ok: true, user };
}

/** Delete an eligible account while protecting the default admin and active session.
 * @param {string} userId Account identifier.
 * @param {object|null} session Current session.
 * @returns {{ok: boolean, error?: string}} Deletion result.
 */
export function deleteManagedUser(userId, session) {
  if (userId === ADMIN_USER.userId) return { ok: false, error: 'Default admin cannot be deleted.' };
  if (!session) return { ok: false, error: 'Sign in as an administrator to manage accounts.' };
  if (session.role !== 'admin') return { ok: false, error: 'Only administrators can manage accounts.' };
  if (session.userId === userId) return { ok: false, error: 'You cannot delete your own account.' };
  const users = readStoredArray(USERS_KEY);
  if (!users.some((user) => user.userId === userId)) return { ok: false, error: 'Account not found.' };
  if (!writeStoredValue(USERS_KEY, users.filter((user) => user.userId !== userId))) {
    return { ok: false, error: 'Browser storage is unavailable. The account was not deleted.' };
  }
  return { ok: true };
}

/** Count accounts by role, including the permanent administrator.
 * @param {Array<object>} users Account records.
 * @returns {{total: number, users: number, admins: number}} Account totals.
 */
export function getUserTotals(users = getUsers()) {
  return {
    total: users.length,
    users: users.filter((user) => user.role === 'user').length,
    admins: users.filter((user) => user.role === 'admin').length,
  };
}
