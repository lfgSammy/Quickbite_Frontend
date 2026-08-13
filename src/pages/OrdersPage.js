import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../api/orders';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { OrdersIcon } from '../components/icons';
import { formatNaira } from '../utils/format';

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <OrdersIcon className="h-10 w-10" />
      </div>
      <h1 className="text-h1 text-brand-black">View Your Orders</h1>
      <p className="mt-2 text-body-sm text-gray-500">
        Login to view your order history and track your ongoing orders.
      </p>
      <Link
        to="/login"
        state={{ from: { pathname: '/orders' } }}
        className="mt-8 w-full rounded-full bg-brand-red py-3.5 text-center text-btn-lg text-white hover:bg-brand-red-dark"
      >
        Login to Continue
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    getOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load your orders.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return <LoginPrompt />;
  if (loading) return <Spinner label="Loading your orders…" />;

  return (
    <div className="px-4 py-6">
      <h1 className="text-h1 text-brand-black">Order History</h1>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
          <Link to="/" className="mt-3 inline-block font-medium text-brand-red">
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
              >
                <div>
                  <p className="text-body font-semibold text-brand-black">Order #{order.id}</p>
                  <p className="text-caption text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body font-semibold text-brand-black">
                    {formatNaira(order.total_amount)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
