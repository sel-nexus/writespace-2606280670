/** Local identity helpers for the demonstration-only WriteSpace application. */
export const USERS_KEY = 'writespace_users';
export const SESSION_KEY = 'writespace_session';
export const ADMIN_USER = Object.freeze({
  userId: 'writespace-default-admin',
  username: 'admin',
  displayName: 'Administrator',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
});

/** Read a JSON array from local storage without allowing corrupt data to crash the app.
 * @param {string} key Storage key to read.
 * @returns {Array} Parsed array, or an empty array when storage is unavailable or invalid.
 */
export function readStoredArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

/** Persist a JSON value and report storage failures to the caller.
 * @param {string} key Storage key to write.
 * @param {unknown} value Serializable value.
 * @returns {boolean} Whether the value was stored successfully.
 */
export function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Return the current session, rejecting malformed or unsupported roles.
 * @returns {object|null} Valid session or null.
 */
export function getSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session.userId !== 'string' || !['admin', 'user'].includes(session.role)) return null;
    return session;
  } catch {
    return null;
  }
}

/** Authenticate the built-in administrator or a locally registered account.
 * @param {string} username Account username.
 * @param {string} password Plain-text demo password.
 * @returns {{ok: boolean, session?: object, error?: string}} Authentication result.
 */
export function login(username, password) {
  if (username === 'admin' && password === 'admin') {
    const session = { ...ADMIN_USER };
    return writeStoredValue(SESSION_KEY, session)
      ? { ok: true, session }
      : { ok: false, error: 'Browser storage is unavailable. Enable local storage and try again.' };
  }

  const account = readStoredArray(USERS_KEY).find(
    (user) => user.username === username && user.password === password,
  );
  if (!account) return { ok: false, error: 'Invalid username or password.' };

  const session = {
    userId: account.userId,
    username: account.username,
    displayName: account.displayName,
    role: account.role,
  };
  return writeStoredValue(SESSION_KEY, session)
    ? { ok: true, session }
    : { ok: false, error: 'Browser storage is unavailable. Enable local storage and try again.' };
}

/** Validate and create a self-registered user account.
 * @param {{displayName: string, username: string, password: string, confirmPassword: string}} input Registration fields.
 * @returns {{ok: boolean, session?: object, errors?: object}} Registration result.
 */
export function register(input) {
  const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
  const username = typeof input.username === 'string' ? input.username.trim() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  const confirmPassword = typeof input.confirmPassword === 'string' ? input.confirmPassword : '';
  const errors = {};

  if (!displayName) errors.displayName = 'Display name is required.';
  if (!username) errors.username = 'Username is required.';
  if (!password) errors.password = 'Password is required.';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  if (password && confirmPassword && password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (username.toLowerCase() === 'admin' || readStoredArray(USERS_KEY).some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    errors.username = 'That username is already taken.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const account = {
    userId: crypto.randomUUID(),
    displayName,
    username,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  const users = readStoredArray(USERS_KEY);
  if (!writeStoredValue(USERS_KEY, [...users, account])) {
    return { ok: false, errors: { form: 'Browser storage is unavailable. Enable local storage and try again.' } };
  }

  const session = {
    userId: account.userId,
    username: account.username,
    displayName: account.displayName,
    role: account.role,
  };
  if (!writeStoredValue(SESSION_KEY, session)) {
    return { ok: false, errors: { form: 'Your account was saved, but the session could not be started. Please log in.' } };
  }
  return { ok: true, session };
}

/** Clear the active local session.
 * @returns {boolean} Whether the session was cleared.
 */
export function logout() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Choose the home route for an authenticated role.
 * @param {object|null} session Current session.
 * @returns {string} Role home route.
 */
export function homeForSession(session) {
  return session?.role === 'admin' ? '/admin' : '/blogs';
}
