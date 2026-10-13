import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getSession, homeForSession, logout } from '../auth/auth.js';
import Avatar from './Avatar.jsx';

/** Render public or authenticated navigation with a state-driven mobile menu.
 * @param {{session?: object|null}} props Optional session override for tests.
 * @returns {JSX.Element} Responsive navigation bar.
 */
export default function Navbar({ session: sessionOverride }) {
  const session = sessionOverride === undefined ? getSession() : sessionOverride;
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const links = session
    ? session.role === 'admin'
      ? [{ to: '/blogs', label: 'All Blogs' }, { to: '/write', label: 'Write' }, { to: '/users', label: 'Users' }]
      : [{ to: '/blogs', label: 'All Blogs' }, { to: '/write', label: 'Write' }]
    : [];

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link aria-label="WriteSpace home" className="font-display text-xl font-bold tracking-tight text-slate-900" to="/">
          Write<span className="text-indigo-600">Space</span>
        </Link>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 sm:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="text-xl">{menuOpen ? '×' : '☰'}</span>
        </button>
        <div className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-2 border-b border-slate-200 bg-white p-4 shadow-lg sm:static sm:flex sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}>
          {session ? (
            <>
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                  onClick={() => setMenuOpen(false)}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              <Link className="rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-indigo-700 active:scale-[0.98]" onClick={() => setMenuOpen(false)} to={homeForSession(session)}>
                Go to Dashboard
              </Link>
              <div className="relative flex items-center gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                <Avatar role={session.role} size="sm" />
                <span className="max-w-32 truncate text-sm font-semibold text-slate-700">{session.displayName}</span>
                <button aria-expanded={accountOpen} aria-label="Account menu" className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100" onClick={() => setAccountOpen((open) => !open)} type="button">
                  ▾
                </button>
                {accountOpen && (
                  <button className="absolute right-0 top-full mt-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg" onClick={handleLogout} type="button">
                    Logout
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <Link className="rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setMenuOpen(false)} to="/login">Login</Link>
              <Link className="rounded-full bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-indigo-700 active:scale-[0.98]" onClick={() => setMenuOpen(false)} to="/register">Get Started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

Navbar.propTypes = {
  session: PropTypes.object,
};
