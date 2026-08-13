import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, cancelOrder } from '../api/orders';
import { initializePayment } from '../api/payment';
import OrderStatusBadge from '../components/OrderStatusBadge';
import QrCodeImage from '../components/QrCodeImage';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { ChevronLeftIcon } from '../components/icons';
import { formatNaira } from '../utils/format';

function describeOrderItem(item) {
  const parts = [];
  if (item.size_name) parts.push(item.size_name);
  if (item.rice_type_name) parts.push(item.rice_type_name);
  if (item.shawarma_option_name) parts.push(item.shawarma_option_name);
  return parts.join(' · ');
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadOrder = useCallback(() => {
    setLoading(true);
    return getOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load this order.')))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  async function handleCancel() {
    setActionError('');
    setBusy(true);
    try {
      await cancelOrder(orderId);
      await loadOrder();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not cancel this order.'));
    } finally {
      setBusy(false);
    }
  }

  async function handlePayNow() {
    setActionError('');
    setBusy(true);
    try {
      const payment = await initializePayment(orderId);
      window.location.href = payment.payment_url;
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Could not start payment.'));
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading order…" />;

  if (error || !order) {
    return (
      <div className="px-4 py-12">
        <ErrorMessage message={error || 'Order not found.'} />
        <Link to="/orders" className="mt-4 inline-block font-medium text-brand-red">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Link to="/orders" className="flex items-center gap-1 text-body-sm font-medium text-gray-500">
        <ChevronLeftIcon className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-h1 text-brand-black">Order #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="mt-1 text-body-sm text-gray-500">
        Pickup: {new Date(order.pickup_time).toLocaleString()}
      </p>

      {actionError && (
        <div className="mt-4">
          <ErrorMessage message={actionError} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-100">
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-body font-medium text-brand-black">
                  {describeOrderItem(item) || `Item #${item.menu_item}`} x{item.quantity}
                </p>
                {item.rice_extras?.length > 0 && (
                  <p className="text-caption text-gray-400">
                    {item.rice_extras.map((e) => `${e.extra_name} x${e.quantity}`).join(', ')}
                  </p>
                )}
                {item.drinks?.length > 0 && (
                  <p className="text-caption text-gray-400">
                    {item.drinks.map((d) => `${d.drink_name} x${d.quantity}`).join(', ')}
                  </p>
                )}
              </div>
              <span className="text-body font-semibold text-brand-black">
                {formatNaira(item.item_total)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between px-4 py-3 text-body font-bold text-brand-black">
          <span>Total</span>
          <span>{formatNaira(order.total_amount)}</span>
        </div>
      </div>

      {order.status === 'pending' && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handlePayNow}
            disabled={busy}
            className="rounded-full bg-brand-red px-5 py-2.5 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
          >
            Pay now
          </button>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-btn-lg font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel order
          </button>
        </div>
      )}

      {['paid', 'preparing', 'ready'].includes(order.status) && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-4 py-6">
          <p className="text-body-sm font-semibold text-brand-black">Show this at pickup</p>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <QrCodeImage value={order.qr_code} size={180} />
          </div>
          <p className="break-all text-center text-caption text-gray-400">{order.qr_code}</p>
        </div>
      )}
    </div>
  );
}
