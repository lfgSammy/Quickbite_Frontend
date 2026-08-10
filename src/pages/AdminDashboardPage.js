import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/admin';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import BackButton from '../components/BackButton';
import { formatNaira } from '../utils/format';

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-brand-black">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load the dashboard.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  if (error || !data) {
    return (
      <div className="px-4 py-12">
        <ErrorMessage message={error || 'Dashboard unavailable.'} />
      </div>
    );
  }

  const { overview, status_breakdown: statusBreakdown, pending_orders: pendingOrders } = data;

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-2xl font-extrabold text-brand-black">Admin Dashboard</h1>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label="Today's revenue" value={formatNaira(overview.today_revenue)} />
        <StatTile label="Today's orders" value={overview.today_orders} />
        <StatTile label="Weekly revenue" value={formatNaira(overview.weekly_revenue)} />
        <StatTile label="Total orders" value={overview.total_orders} />
      </div>

      {statusBreakdown?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-brand-black">Orders by status</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {statusBreakdown.map((s) => (
              <div
                key={s.status}
                className="flex items-center gap-2 rounded-full border border-gray-100 py-1 pl-1 pr-3"
              >
                <OrderStatusBadge status={s.status} />
                <span className="text-sm font-semibold text-brand-black">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-brand-black">Pending orders</h2>
        <Link to="/kitchen" className="text-sm font-semibold text-brand-red">
          Manage in Kitchen
        </Link>
      </div>

      {pendingOrders?.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Nothing pending right now.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {pendingOrders?.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-brand-black">Order #{order.id}</p>
                <p className="text-xs text-gray-400">
                  Pickup: {new Date(order.pickup_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-brand-black">
                  {formatNaira(order.total_amount)}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
