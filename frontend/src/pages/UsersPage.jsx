import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Avatar from '../components/Avatar.jsx';
import { getSession } from '../auth/auth.js';
import { createManagedUser, deleteManagedUser, getUsers } from '../admin/users.js';

const initialForm = { displayName: '', username: '', password: '', role: 'user' };

/** Format an account creation date.
 * @param {string} value ISO date string.
 * @returns {string} Formatted date or a safe fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render administrator account creation and deletion controls.
 * @returns {JSX.Element} User management page.
 */
export default function UsersPage() {
  const session = getSession();
  const [users, setUsers] = useState(getUsers);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  function handleCreate(event) {
    event.preventDefault();
    const result = createManagedUser(form);
    if (!result.ok) {
      setErrors(result.errors);
      setNotice('');
      return;
    }
    setUsers(getUsers());
    setForm(initialForm);
    setErrors({});
    setNotice(`${result.user.displayName} was added.`);
  }

  function handleDelete(user) {
    if (user.userId === 'writespace-default-admin') return;
    if (session?.userId === user.userId) return;
    if (!window.confirm(`Delete ${user.displayName}'s account?`)) return;
    const result = deleteManagedUser(user.userId, session);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setUsers(getUsers());
    setNotice(`${user.displayName}'s account was deleted.`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link className="text-sm font-semibold text-indigo-700 hover:underline" to="/admin">← Back to Dashboard</Link>
        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Account administration</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Manage Users</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Create demo accounts and remove accounts that are no longer needed.</p>
        </div>
        <section aria-labelledby="create-user-heading" className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-bold" id="create-user-heading">Create User</h2>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" noValidate onSubmit={handleCreate}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-display-name">Display Name</label>
              <input aria-describedby={errors.displayName ? 'user-display-name-error' : undefined} aria-invalid={Boolean(errors.displayName)} aria-required="true" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-display-name" onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} value={form.displayName} />
              {errors.displayName && <p className="mt-1 text-sm text-rose-700" id="user-display-name-error" role="alert">{errors.displayName}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-username">Username</label>
              <input aria-describedby={errors.username ? 'user-username-error' : undefined} aria-invalid={Boolean(errors.username)} aria-required="true" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-username" onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} value={form.username} />
              {errors.username && <p className="mt-1 text-sm text-rose-700" id="user-username-error" role="alert">{errors.username}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-password">Password</label>
              <input aria-describedby={errors.password ? 'user-password-error' : undefined} aria-invalid={Boolean(errors.password)} aria-required="true" autoComplete="new-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-password" onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" value={form.password} />
              {errors.password && <p className="mt-1 text-sm text-rose-700" id="user-password-error" role="alert">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-role">Role</label>
              <select aria-describedby={errors.role ? 'user-role-error' : undefined} aria-invalid={Boolean(errors.role)} aria-required="true" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-role" onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} value={form.role}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-rose-700" id="user-role-error" role="alert">{errors.role}</p>}
            </div>
            {errors.form && <p className="text-sm text-rose-700 sm:col-span-2" role="alert">{errors.form}</p>}
            <div className="sm:col-span-2">
              <button className="rounded-full bg-indigo-700 px-6 py-3 font-bold text-white hover:bg-indigo-800" type="submit">Create Account</button>
            </div>
          </form>
          {notice && <p className="mt-4 text-sm font-medium text-slate-700" role="status">{notice}</p>}
        </section>
        <section aria-labelledby="accounts-heading" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold" id="accounts-heading">Accounts</h2>
              <p className="mt-1 text-sm text-slate-600">{users.length} accounts in this browser</p>
            </div>
          </div>
          <div className="mt-5 hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4 font-semibold" scope="col">Account</th>
                  <th className="px-5 py-4 font-semibold" scope="col">Username</th>
                  <th className="px-5 py-4 font-semibold" scope="col">Role</th>
                  <th className="px-5 py-4 font-semibold" scope="col">Created</th>
                  <th className="px-5 py-4 text-right font-semibold" scope="col">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isDefault = user.userId === 'writespace-default-admin';
                  const isCurrent = session?.userId === user.userId;
                  return (
                    <tr key={user.userId}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar role={user.role} size="sm" /><span className="font-semibold">{user.displayName}</span></div></td>
                      <td className="px-5 py-4 text-slate-600">{user.username}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.role === 'admin' ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4 text-right"><button aria-label={isDefault ? 'Default admin cannot be deleted' : isCurrent ? 'You cannot delete your own account' : `Delete ${user.displayName}`} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isDefault || isCurrent} onClick={() => handleDelete(user)} title={isDefault ? 'Default admin cannot be deleted.' : isCurrent ? 'You cannot delete your own account.' : undefined} type="button">Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-4 md:hidden">
            {users.map((user) => {
              const isDefault = user.userId === 'writespace-default-admin';
              const isCurrent = session?.userId === user.userId;
              return (
                <article className="rounded-2xl bg-white p-5 shadow-sm" key={user.userId}>
                  <div className="flex items-center gap-3"><Avatar role={user.role} size="sm" /><div><h3 className="font-semibold">{user.displayName}</h3><p className="text-sm text-slate-500">@{user.username}</p></div></div>
                  <div className="mt-4 flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.role === 'admin' ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span><span className="text-xs text-slate-500">{formatDate(user.createdAt)}</span></div>
                  <button aria-label={isDefault ? 'Default admin cannot be deleted' : isCurrent ? 'You cannot delete your own account' : `Delete ${user.displayName}`} className="mt-4 w-full rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isDefault || isCurrent} onClick={() => handleDelete(user)} title={isDefault ? 'Default admin cannot be deleted.' : isCurrent ? 'You cannot delete your own account.' : undefined} type="button">Delete</button>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
