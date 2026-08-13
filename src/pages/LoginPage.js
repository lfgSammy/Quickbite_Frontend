import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';

const inputClass =
  'rounded-xl border border-gray-200 px-3 py-2.5 text-input focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid username or password.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-h1 text-brand-black">Welcome back</h1>
        <p className="mt-1 text-body-sm text-gray-500">Log in to order from QuickBite.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorMessage message={error} />

        <label className="flex flex-col gap-1">
          <span className="text-label text-brand-black">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-brand-black">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-brand-red py-3.5 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-body-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-red">
          Sign up
        </Link>
      </p>
    </div>
  );
}
