import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getOperatingHours } from '../api/auth';
import { createOrder } from '../api/orders';
import { initializePayment } from '../api/payment';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { formatNaira } from '../utils/format';

function defaultPickupTime() {
  const dt = new Date(Date.now() + 30 * 60 * 1000);
  dt.setSeconds(0, 0);
  const offset = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function CheckoutPage() {
  const { cart, loading, refreshCart } = useCart();
  const [hours, setHours] = useState([]);
  const [pickupTime, setPickupTime] = useState(defaultPickupTime());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getOperatingHours()
      .then(setHours)
      .catch(() => {});
  }, []);

  const items = cart?.items || [];

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const isoPickupTime = new Date(pickupTime).toISOString();
      const order = await createOrder({ pickup_time: isoPickupTime });
      const payment = await initializePayment(order.id);
      await refreshCart().catch(() => {});
      window.location.href = payment.payment_url;
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not place your order.'));
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading checkout…" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link to="/" className="mt-3 inline-block text-orange-600 hover:underline">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-6 rounded-md border border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Order summary</h2>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-gray-700">
              <span>
                {item.menu_item.name} x{item.quantity}
              </span>
              <span>{formatNaira(item.total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatNaira(cart.total)}</span>
        </div>
      </div>

      {hours.length > 0 && (
        <div className="mt-6 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-2 font-semibold text-gray-800">Operating hours</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {hours.map((h) => (
              <li key={h.day}>
                {h.day}: {h.is_open ? `${h.open_time} – ${h.close_time}` : 'Closed'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="mt-6 flex flex-col gap-4">
        <ErrorMessage message={error} />

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Pickup time</span>
          <input
            type="datetime-local"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {submitting ? 'Placing order…' : `Pay ${formatNaira(cart.total)} with Paystack`}
        </button>
      </form>
    </div>
  );
}
