import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getSession, homeForSession, login } from '../auth/auth.js';

/** Render the local demo login form.
 * @returns {JSX.Element} Login page.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (session) return <Navigate replace to={homeForSession(session)} />;

  function handleSubmit(event) {
    event.preventDefault();
    const result = login(username.trim(), password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(homeForSession(result.session), { replace: true });
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-indigo-700 via-violet-700 to-pink-600 px-4 py-12">
      <section aria-labelledby="login-heading" className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-10">
        <Link className="font-display text-xl font-bold text-slate-900" to="/">Write<span className="text-indigo-600">Space</span></Link>
        <h1 className="mt-8 font-display text-3xl font-bold text-slate-900" id="login-heading">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to read and write.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="username">Username</label>
            <input aria-required="true" autoComplete="username" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="username" onChange={(event) => setUsername(event.target.value)} required value={username} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
            <input aria-required="true" autoComplete="current-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </div>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800" role="alert">{error}</p>}
          <button className="w-full rounded-full bg-indigo-700 px-5 py-3 font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-indigo-800 active:scale-[0.98]" type="submit">Login</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">New to WriteSpace? <Link className="font-semibold text-indigo-700 hover:underline" to="/register">Register</Link></p>
        <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">Demo admin: username <strong>admin</strong>, password <strong>admin</strong>. Do not use real passwords.</p>
      </section>
    </main>
  );
}
