import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileIcon } from '../components/icons';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';

const inputClass =
  'rounded-xl border border-gray-200 px-3 py-2.5 text-input focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red';

function EditProfileForm({ user, onSaved, onCancel }) {
  const { updateUserProfile } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await updateUserProfile(form);
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update your profile.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-2xl border border-gray-100 p-4">
      <ErrorMessage message={error} />

      <label className="flex flex-col gap-1">
        <span className="text-label text-brand-black">Username</span>
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label text-brand-black">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-label text-brand-black">Phone number</span>
        <input
          value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          className={inputClass}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-full bg-brand-red py-3 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-gray-200 py-3 text-btn-lg text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ProfileIcon className="h-10 w-10" />
        </div>
        <h1 className="text-h1 text-brand-black">Your Account</h1>
        <p className="mt-2 text-body-sm text-gray-500">
          Log in to track orders, save your details, and check out faster.
        </p>

        <Link
          to="/login"
          className="mt-8 w-full rounded-full bg-brand-red py-3.5 text-center text-btn-lg text-white hover:bg-brand-red-dark"
        >
          Login to Continue
        </Link>
        <Link to="/register" className="mt-4 text-body-sm font-medium text-brand-red">
          Create an account
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <ProfileIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-h5 text-brand-black">{user?.username}</p>
            <p className="text-body-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-btn-sm font-semibold text-brand-red"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <EditProfileForm user={user} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      ) : (
        <div className="mt-8 flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-body-sm text-gray-500">Phone number</span>
            <span className="text-body-sm font-medium text-brand-black">
              {user?.phone_number || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-body-sm text-gray-500">Role</span>
            <span className="text-body-sm font-medium capitalize text-brand-black">{user?.role}</span>
          </div>
        </div>
      )}

      {(user?.role === 'kitchen' || user?.role === 'admin') && (
        <Link
          to="/kitchen"
          className="mt-4 block rounded-2xl border border-gray-100 px-4 py-3.5 text-center text-btn-sm text-brand-black hover:bg-gray-50"
        >
          Kitchen Queue
        </Link>
      )}

      {user?.role === 'admin' && (
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to="/admin"
            className="block rounded-2xl border border-gray-100 px-4 py-3.5 text-center text-btn-sm text-brand-black hover:bg-gray-50"
          >
            Admin Dashboard
          </Link>
          <Link
            to="/admin/menu"
            className="block rounded-2xl border border-gray-100 px-4 py-3.5 text-center text-btn-sm text-brand-black hover:bg-gray-50"
          >
            Menu Admin
          </Link>
          <Link
            to="/admin/roles"
            className="block rounded-2xl border border-gray-100 px-4 py-3.5 text-center text-btn-sm text-brand-black hover:bg-gray-50"
          >
            Manage Roles
          </Link>
          <Link
            to="/admin/hours"
            className="block rounded-2xl border border-gray-100 px-4 py-3.5 text-center text-btn-sm text-brand-black hover:bg-gray-50"
          >
            Operating Hours
          </Link>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 w-full rounded-full border border-brand-red py-3.5 text-btn-sm text-brand-red hover:bg-red-50"
      >
        Log out
      </button>
    </div>
  );
}
