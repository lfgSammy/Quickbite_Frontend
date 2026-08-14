import { useEffect, useState } from 'react';
import { getMenuItems } from '../api/menu';
import { useAuth } from '../context/AuthContext';
import MenuItemCard from '../components/MenuItemCard';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'rice', label: 'Rice' },
  { value: 'shawarma', label: 'Shawarma' },
];

export default function MenuPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMenuItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load the menu.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = items.filter(
    (item) => filter === 'all' || item.item_type === filter
  );

  return (
    <div className="px-4 py-5">
      <h1 className="text-h1 text-brand-black">
        Welcome, {user?.username || 'Guest'}
      </h1>
      <p className="mt-1 text-body-sm text-gray-500">What would you like to eat today?</p>

      <div className="relative mt-5 overflow-hidden rounded-3xl bg-brand-black px-6 py-8">
        <p className="text-caption font-bold uppercase tracking-widest text-white/70">
          Freshly made, every day
        </p>
        <p className="mt-2 text-display">
          <span className="text-white">Order</span>{' '}
          <span className="text-brand-yellow">Ahead</span>
        </p>
        <p className="mt-3 max-w-[70%] text-body-sm text-white/70">
          Skip the queue, customize your meal and pick it up when it's ready
        </p>
      </div>

      <div className="mt-6 rounded-full bg-brand-black py-3 text-center text-btn-sm uppercase tracking-widest text-white">
        Menu
      </div>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-btn-sm transition ${
              filter === f.value
                ? 'bg-brand-red text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading ? (
        <Spinner label="Loading menu…" />
      ) : visibleItems.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No items found.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {visibleItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
