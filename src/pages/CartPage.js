import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { CartIcon } from '../components/icons';
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
    <li className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-brand-black">{item.menu_item.name}</p>
          <p className="text-sm text-gray-500">{describeItem(item)}</p>
          {addedExtras.length > 0 && (
            <p className="mt-1 text-xs text-gray-400">{addedExtras.join(', ')}</p>
          )}
        </div>
        <span className="font-bold text-brand-black">{formatNaira(item.total)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdateQuantity(item, Math.max(1, item.quantity - 1))}
            className="h-7 w-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
            className="h-7 w-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(item)}
          className="text-sm font-medium text-brand-red disabled:opacity-50"
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
    <div className="px-4 py-6">
      <h1 className="text-2xl font-extrabold text-brand-black">Your Cart</h1>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <CartIcon className="h-10 w-10" />
          </div>
          <p className="text-gray-500">Your cart is empty.</p>
          <Link to="/" className="mt-3 inline-block font-medium text-brand-red">
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 flex flex-col gap-3">
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

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-base font-semibold text-brand-black">Total</span>
            <span className="text-xl font-extrabold text-brand-black">
              {formatNaira(cart.total)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full rounded-full bg-brand-red py-3.5 text-sm font-bold text-white hover:bg-brand-red-dark"
          >
            Proceed to checkout
          </button>
        </>
      )}
    </div>
  );
}
