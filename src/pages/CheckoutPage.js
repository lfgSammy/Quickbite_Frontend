import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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
  const [pickupTime, setPickupTime] = useState(defaultPickupTime());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      <div className="px-6 py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link to="/" className="mt-3 inline-block font-medium text-brand-red">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-h1 text-brand-black">Checkout</h1>

      <div className="mt-6 rounded-2xl border border-gray-100 p-4">
        <h2 className="mb-3 text-label text-brand-black">Order summary</h2>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-body-sm text-gray-600">
              <span>
                {item.menu_item.name} x{item.quantity}
              </span>
              <span>{formatNaira(item.total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-body font-bold text-brand-black">
          <span>Total</span>
          <span>{formatNaira(cart.total)}</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="mt-6 flex flex-col gap-4">
        <ErrorMessage message={error} />

        <label className="flex flex-col gap-1">
          <span className="text-label text-brand-black">Pickup time</span>
          <input
            type="datetime-local"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-input focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-brand-red py-3.5 text-btn-lg text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {submitting ? 'Placing order…' : 'Buy Now'}
        </button>
      </form>
    </div>
  );
}
