import { useCallback, useEffect, useState } from 'react';
import { getUsers, assignRole } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import BackButton from '../components/BackButton';

const ROLES = ['customer', 'kitchen', 'admin'];

function UserRow({ user, onChangeRole, busy, isSelf }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-4">
      <div>
        <p className="text-body font-semibold text-brand-black">{user.username}</p>
        <p className="text-caption text-gray-400">{user.email}</p>
      </div>
      <select
        value={user.role}
        disabled={busy || isSelf}
        onChange={(e) => onChangeRole(user, e.target.value)}
        className="rounded-full border border-gray-200 px-3 py-1.5 text-btn-sm capitalize text-brand-black disabled:opacity-60"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </li>
  );
}

export default function AdminRolesPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadUsers = useCallback((searchTerm) => {
    setLoading(true);
    return getUsers(searchTerm ? { search: searchTerm } : {})
      .then(setUsers)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load users.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(timeout);
  }, [search, loadUsers]);

  async function handleChangeRole(user, role) {
    setError('');
    setBusyId(user.id);
    try {
      await assignRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update this user’s role.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-h1 text-brand-black">Manage Roles</h1>
      </div>
      <p className="mt-1 text-body-sm text-gray-500">
        Promote staff to kitchen or admin access.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by username"
        className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-input focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
      />

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading ? (
        <Spinner label="Loading users…" />
      ) : users.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No users found.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              busy={busyId === user.id}
              isSelf={user.id === currentUser?.id}
              onChangeRole={handleChangeRole}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
