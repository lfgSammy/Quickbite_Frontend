import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { GoogleIcon } from '../components/icons';
import { redirectToGoogle } from '../utils/googleAuth';
import PasswordInput from '../components/PasswordInput';
import PasswordRequirements from '../components/PasswordRequirements';

const inputClass =
  'rounded-xl border border-gray-200 px-3 py-2.5 text-input focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
  });
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
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create your account.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-h1 text-brand-black">Create your Account</h1>
        <p className="mt-1 text-body-sm text-gray-500">
          Sign up to order ahead and skip the line.
        </p>
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
          <span className="text-label text-brand-black">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-brand-black">
            Phone number (optional)
          </span>
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-brand-black">Password</span>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <PasswordRequirements password={form.password} />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-brand-red py-3.5 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-caption text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        onClick={() => redirectToGoogle('/')}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3 text-btn-lg font-medium text-brand-black hover:bg-gray-50"
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </button>

      <p className="text-center text-body-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-red">
          Log in
        </Link>
      </p>
    </div>
  );
}
