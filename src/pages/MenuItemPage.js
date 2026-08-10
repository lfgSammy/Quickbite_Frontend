import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getMenuItem,
  getRiceTypes,
  getRiceExtras,
  getShawarmaExtras,
  getDrinks,
} from '../api/menu';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import { ChevronLeftIcon } from '../components/icons';
import { formatNaira } from '../utils/format';

function OptionPill({ selected, children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        selected
          ? 'border-brand-red bg-brand-red text-white'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function Stepper({ value, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        className="h-7 w-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        −
      </button>
      <span className="w-4 text-center text-sm font-semibold text-brand-black">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="h-7 w-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        +
      </button>
    </div>
  );
}

export default function MenuItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [riceTypes, setRiceTypes] = useState([]);
  const [riceExtras, setRiceExtras] = useState([]);
  const [shawarmaExtras, setShawarmaExtras] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [sizeId, setSizeId] = useState('');
  const [riceTypeId, setRiceTypeId] = useState('');
  const [shawarmaOptionId, setShawarmaOptionId] = useState('');
  const [riceExtraQty, setRiceExtraQty] = useState({});
  const [shawarmaExtraOn, setShawarmaExtraOn] = useState({});
  const [drinkQty, setDrinkQty] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getMenuItem(id)
      .then(async (data) => {
        if (cancelled) return;
        setItem(data);
        if (data.sizes?.length) setSizeId(String(data.sizes[0].id));
        if (data.shawarma_options?.length) {
          setShawarmaOptionId(String(data.shawarma_options[0].id));
        }

        const requests = [getDrinks()];
        if (data.item_type === 'rice') {
          requests.push(getRiceTypes(), getRiceExtras());
        } else if (data.item_type === 'shawarma') {
          requests.push(getShawarmaExtras());
        }

        const results = await Promise.all(requests);
        if (cancelled) return;

        setDrinks(results[0]);
        if (data.item_type === 'rice') {
          setRiceTypes(results[1]);
          setRiceExtras(results[2]);
          if (results[1]?.length) setRiceTypeId(String(results[1][0].id));
        } else if (data.item_type === 'shawarma') {
          setShawarmaExtras(results[1]);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load this item.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const selectedSize = item?.sizes?.find((s) => String(s.id) === sizeId);
  const selectedShawarmaOption = item?.shawarma_options?.find(
    (o) => String(o.id) === shawarmaOptionId
  );

  const total = useMemo(() => {
    const basePrice = Number(selectedSize?.price ?? selectedShawarmaOption?.price ?? 0);

    const riceExtrasTotal = riceExtras.reduce((sum, extra) => {
      const qty = riceExtraQty[extra.id] || 0;
      return sum + Number(extra.price) * qty;
    }, 0);

    const shawarmaExtrasTotal = shawarmaExtras.reduce((sum, extra) => {
      return shawarmaExtraOn[extra.id] ? sum + Number(extra.price) : sum;
    }, 0);

    const drinksTotal = drinks.reduce((sum, drink) => {
      const qty = drinkQty[drink.id] || 0;
      return sum + Number(drink.price) * qty;
    }, 0);

    return basePrice * quantity + riceExtrasTotal + shawarmaExtrasTotal + drinksTotal;
  }, [
    selectedSize,
    selectedShawarmaOption,
    quantity,
    riceExtras,
    riceExtraQty,
    shawarmaExtras,
    shawarmaExtraOn,
    drinks,
    drinkQty,
  ]);

  function updateRiceExtraQty(extraId, qty, maxQuantity) {
    const clamped = Math.max(0, Math.min(qty, maxQuantity));
    setRiceExtraQty((prev) => ({ ...prev, [extraId]: clamped }));
  }

  function toggleShawarmaExtra(extraId) {
    setShawarmaExtraOn((prev) => ({ ...prev, [extraId]: !prev[extraId] }));
  }

  function updateDrinkQty(drinkId, qty) {
    const clamped = Math.max(0, qty);
    setDrinkQty((prev) => ({ ...prev, [drinkId]: clamped }));
  }

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/menu/${id}` } } });
      return;
    }

    setError('');
    setSubmitting(true);

    const payload = {
      menu_item_id: item.id,
      quantity,
      drinks: Object.entries(drinkQty)
        .filter(([, qty]) => qty > 0)
        .map(([drink_id, qty]) => ({ drink_id: Number(drink_id), quantity: qty })),
    };

    if (item.item_type === 'rice') {
      payload.size_id = Number(sizeId);
      if (riceTypeId) payload.rice_type_id = Number(riceTypeId);
      payload.rice_extras = Object.entries(riceExtraQty)
        .filter(([, qty]) => qty > 0)
        .map(([extra_id, qty]) => ({ extra_id: Number(extra_id), quantity: qty }));
    } else if (item.item_type === 'shawarma') {
      payload.shawarma_option_id = Number(shawarmaOptionId);
      payload.shawarma_extras = Object.entries(shawarmaExtraOn)
        .filter(([, on]) => on)
        .map(([extra_id]) => ({ extra_id: Number(extra_id), is_added: true }));
    }

    try {
      await addItem(payload);
      navigate('/cart');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add this item to your cart.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading item…" />;

  if (error && !item) {
    return (
      <div className="px-4 py-12">
        <ErrorMessage message={error} />
        <Link to="/" className="mt-4 inline-block font-medium text-brand-red">
          Back to menu
        </Link>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="pb-4">
      <Link to="/" className="flex items-center gap-1 px-4 pt-4 text-sm font-medium text-gray-500">
        <ChevronLeftIcon className="h-4 w-4" />
        Back to menu
      </Link>

      <div className="mt-3 aspect-square w-full overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            No image
          </div>
        )}
      </div>

      <div className="px-4">
        <h1 className="mt-4 text-2xl font-extrabold text-brand-black">{item.name}</h1>
        {item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}
        {!item.is_available && (
          <p className="mt-3 text-sm font-semibold text-brand-red">
            This item is currently unavailable.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-6">
          {error && <ErrorMessage message={error} />}

          {item.item_type === 'rice' && item.sizes?.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-brand-black">Size</legend>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((size) => (
                  <OptionPill
                    key={size.id}
                    selected={sizeId === String(size.id)}
                    onClick={() => setSizeId(String(size.id))}
                  >
                    {size.name} · {formatNaira(size.price)}
                  </OptionPill>
                ))}
              </div>
            </fieldset>
          )}

          {item.item_type === 'rice' && riceTypes.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-brand-black">Rice type</legend>
              <div className="flex flex-wrap gap-2">
                {riceTypes.map((type) => (
                  <OptionPill
                    key={type.id}
                    selected={riceTypeId === String(type.id)}
                    onClick={() => setRiceTypeId(String(type.id))}
                  >
                    {type.name}
                  </OptionPill>
                ))}
              </div>
            </fieldset>
          )}

          {item.item_type === 'rice' && riceExtras.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-brand-black">Extras</legend>
              <div className="flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-100">
                {riceExtras.map((extra) => (
                  <div key={extra.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-brand-black">{extra.name}</p>
                      <p className="text-xs text-gray-400">{formatNaira(extra.price)} each</p>
                    </div>
                    <Stepper
                      value={riceExtraQty[extra.id] || 0}
                      onDecrement={() =>
                        updateRiceExtraQty(
                          extra.id,
                          (riceExtraQty[extra.id] || 0) - 1,
                          extra.max_quantity
                        )
                      }
                      onIncrement={() =>
                        updateRiceExtraQty(
                          extra.id,
                          (riceExtraQty[extra.id] || 0) + 1,
                          extra.max_quantity
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          )}

          {item.item_type === 'shawarma' && item.shawarma_options?.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-brand-black">Option</legend>
              <div className="flex flex-wrap gap-2">
                {item.shawarma_options
                  .filter((o) => o.is_available)
                  .map((option) => (
                    <OptionPill
                      key={option.id}
                      selected={shawarmaOptionId === String(option.id)}
                      onClick={() => setShawarmaOptionId(String(option.id))}
                    >
                      {option.name} · {formatNaira(option.price)}
                    </OptionPill>
                  ))}
              </div>
            </fieldset>
          )}

          {item.item_type === 'shawarma' && shawarmaExtras.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-brand-black">Extras</legend>
              <div className="flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-100">
                {shawarmaExtras.map((extra) => (
                  <label
                    key={extra.id}
                    className="flex cursor-pointer items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-brand-black">{extra.name}</p>
                      <p className="text-xs text-gray-400">{formatNaira(extra.price)}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!shawarmaExtraOn[extra.id]}
                      onChange={() => toggleShawarmaExtra(extra.id)}
                      className="h-4 w-4 accent-brand-red"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {drinks.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-brand-black">Add a drink</legend>
              <div className="flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-100">
                {drinks
                  .filter((d) => d.is_available)
                  .map((drink) => (
                    <div key={drink.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-brand-black">{drink.name}</p>
                        <p className="text-xs text-gray-400">{formatNaira(drink.price)} each</p>
                      </div>
                      <Stepper
                        value={drinkQty[drink.id] || 0}
                        onDecrement={() => updateDrinkQty(drink.id, (drinkQty[drink.id] || 0) - 1)}
                        onIncrement={() => updateDrinkQty(drink.id, (drinkQty[drink.id] || 0) + 1)}
                      />
                    </div>
                  ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-brand-black">Quantity</legend>
            <Stepper
              value={quantity}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
              onIncrement={() => setQuantity((q) => q + 1)}
            />
          </fieldset>

          <div className="sticky bottom-20 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-extrabold text-brand-black">{formatNaira(total)}</p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={submitting || !item.is_available}
              className="rounded-full bg-brand-red px-6 py-3 text-sm font-bold text-white hover:bg-brand-red-dark disabled:opacity-60"
            >
              {submitting ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
