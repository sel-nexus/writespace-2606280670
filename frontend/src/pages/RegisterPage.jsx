import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getSession, homeForSession, register } from '../auth/auth.js';

const fields = [
  { name: 'displayName', label: 'Display Name', type: 'text', autoComplete: 'name' },
  { name: 'username', label: 'Username', type: 'text', autoComplete: 'username' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm Password', type: 'password', autoComplete: 'new-password' },
];

/** Render the self-registration form with field-associated validation errors.
 * @returns {JSX.Element} Registration page.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [values, setValues] = useState({ displayName: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  if (session) return <Navigate replace to={homeForSession(session)} />;

  function handleSubmit(event) {
    event.preventDefault();
    const result = register(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    navigate('/blogs', { replace: true });
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-indigo-700 via-violet-700 to-pink-600 px-4 py-10">
      <section aria-labelledby="register-heading" className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-10">
        <Link className="font-display text-xl font-bold text-slate-900" to="/">Write<span className="text-indigo-600">Space</span></Link>
        <h1 className="mt-7 font-display text-3xl font-bold text-slate-900" id="register-heading">Make room for your words</h1>
        <p className="mt-2 text-slate-600">Create a local account to start writing.</p>
        <form className="mt-7 space-y-4" noValidate onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name}>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={field.name}>{field.label}</label>
              <input
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                aria-invalid={Boolean(errors[field.name])}
                aria-required="true"
                autoComplete={field.autoComplete}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                id={field.name}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                required
                type={field.type}
                value={values[field.name]}
              />
              {errors[field.name] && <p className="mt-1 text-sm text-rose-700" id={`${field.name}-error`} role="alert">{errors[field.name]}</p>}
            </div>
          ))}
          {errors.form && <p className="text-sm text-rose-700" role="alert">{errors.form}</p>}
          <button className="w-full rounded-full bg-indigo-700 px-5 py-3 font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-indigo-800 active:scale-[0.98]" type="submit">Create Account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link className="font-semibold text-indigo-700 hover:underline" to="/login">Login</Link></p>
        <p className="mt-4 text-center text-xs text-slate-500">Demo only. Account data is stored in this browser and passwords are not encrypted.</p>
      </section>
    </main>
  );
}
