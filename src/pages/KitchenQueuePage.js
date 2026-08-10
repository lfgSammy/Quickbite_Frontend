import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import { updateOrderStatus } from '../api/kitchen';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { ScanIcon } from '../components/icons';
import BackButton from '../components/BackButton';
import { formatNaira } from '../utils/format';

const FILTERS = [
  { value: 'active', label: 'Active', statuses: ['paid', 'preparing'] },
  { value: 'ready', label: 'Ready', statuses: ['ready'] },
  { value: 'all', label: 'All', statuses: null },
];

function QueueOrderCard({ order, onAdvance, onCancel, busy }) {
  return (
    <li className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-brand-black">Order #{order.id}</p>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Pickup: {new Date(order.pickup_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
      <ul className="mt-2 text-sm text-gray-600">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity}× {item.size_name || item.shawarma_option_name || 'Item'}
          </li>
        ))}
      </ul>
      <p className="mt-2 font-semibold text-brand-black">{formatNaira(order.total_amount)}</p>

      {(order.status === 'paid' || order.status === 'preparing') && (
        <div className="mt-3 flex gap-2">
          {order.status === 'paid' && (
            <button
              disabled={busy}
              onClick={() => onAdvance(order, 'preparing')}
              className="flex-1 rounded-full bg-brand-black py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              Start preparing
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              disabled={busy}
              onClick={() => onAdvance(order, 'ready')}
              className="flex-1 rounded-full bg-brand-red py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              Mark ready
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => onCancel(order)}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}

export default function KitchenQueuePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('active');

  const loadOrders = useCallback(() => {
    setLoading(true);
    return getOrders()
      .then(setOrders)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load orders.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleAdvance(order, nextStatus) {
    setActionError('');
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, nextStatus);
      await loadOrders();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not update this order.'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(order) {
    setActionError('');
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, 'cancelled');
      await loadOrders();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not cancel this order.'));
    } finally {
      setBusyId(null);
    }
  }

  const activeFilter = FILTERS.find((f) => f.value === filter);
  const visibleOrders = orders
    .filter((o) => !activeFilter.statuses || activeFilter.statuses.includes(o.status))
    .sort((a, b) => new Date(a.pickup_time) - new Date(b.pickup_time));

  if (loading) return <Spinner label="Loading orders…" />;

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl font-extrabold text-brand-black">Kitchen Queue</h1>
        </div>
        <Link
          to="/kitchen/scan"
          className="flex items-center gap-1.5 rounded-full bg-brand-black px-3 py-2 text-xs font-bold text-white"
        >
          <ScanIcon className="h-4 w-4" />
          Scan
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
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
      {actionError && (
        <div className="mt-4">
          <ErrorMessage message={actionError} />
        </div>
      )}

      {visibleOrders.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No orders here.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <QueueOrderCard
              key={order.id}
              order={order}
              busy={busyId === order.id}
              onAdvance={handleAdvance}
              onCancel={handleCancel}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
