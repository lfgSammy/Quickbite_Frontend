import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { formatNaira } from '../utils/format';

function describeItem(item) {
  const parts = [];
  if (item.size) parts.push(item.size.name);
  if (item.rice_type) parts.push(item.rice_type.name);
  if (item.shawarma_option) parts.push(item.shawarma_option.name);
  return parts.join(' · ');
}

function CartItemRow({ item, onUpdateQuantity, onRemove, busy }) {
  const addedExtras = [
    ...(item.rice_extras || []).map((e) => `${e.extra.name} x${e.quantity}`),
    ...(item.shawarma_extras || []).filter((e) => e.is_added).map((e) => e.extra.name),
    ...(item.drinks || []).map((d) => `${d.drink.name} x${d.quantity}`),
  ];

  return (
    <li className="flex flex-col gap-3 border-b border-gray-100 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.menu_item.name}</p>
        <p className="text-sm text-gray-500">{describeItem(item)}</p>
        {addedExtras.length > 0 && (
          <p className="mt-1 text-xs text-gray-400">{addedExtras.join(', ')}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdateQuantity(item, Math.max(1, item.quantity - 1))}
            className="h-7 w-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            −
          </button>
          <span className="w-5 text-center text-sm">{item.quantity}</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
            className="h-7 w-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
        </div>

        <span className="w-24 text-right font-semibold text-gray-900">
          {formatNaira(item.total)}
        </span>

        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(item)}
          className="text-sm text-red-500 hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState(null);

  async function handleUpdateQuantity(item, quantity) {
    setError('');
    setBusyItemId(item.id);
    try {
      await updateItem(item.id, { quantity });
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update that item.'));
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleRemove(item) {
    setError('');
    setBusyItemId(item.id);
    try {
      await removeItem(item.id);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not remove that item.'));
      setBusyItemId(null);
    }
  }

  if (loading) return <Spinner label="Loading your cart…" />;

  const items = cart?.items || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link to="/" className="mt-3 inline-block text-orange-600 hover:underline">
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                busy={busyItemId === item.id}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">{formatNaira(cart.total)}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full rounded-md bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Proceed to checkout
          </button>
        </>
      )}
    </div>
  );
}
