import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileIcon } from '../components/icons';

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ProfileIcon className="h-8 w-8" />
        </div>
        <div>
          <p className="text-h5 text-brand-black">{user?.username}</p>
          <p className="text-body-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

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
