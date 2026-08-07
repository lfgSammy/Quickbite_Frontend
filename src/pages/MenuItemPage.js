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
import { formatNaira } from '../utils/format';

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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <ErrorMessage message={error} />
        <Link to="/" className="mt-4 inline-block text-orange-600 hover:underline">
          Back to menu
        </Link>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-orange-600 hover:underline">
        ← Back to menu
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
          {item.description && <p className="mt-2 text-gray-500">{item.description}</p>}
          {!item.is_available && (
            <p className="mt-3 text-sm font-medium text-red-500">
              This item is currently unavailable.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {error && <ErrorMessage message={error} />}

        {item.item_type === 'rice' && item.sizes?.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900">Size</legend>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((size) => (
                <button
                  type="button"
                  key={size.id}
                  onClick={() => setSizeId(String(size.id))}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                    sizeId === String(size.id)
                      ? 'border-orange-600 bg-orange-50 text-orange-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size.name} · {formatNaira(size.price)}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {item.item_type === 'rice' && riceTypes.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900">Rice type</legend>
            <div className="flex flex-wrap gap-2">
              {riceTypes.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setRiceTypeId(String(type.id))}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                    riceTypeId === String(type.id)
                      ? 'border-orange-600 bg-orange-50 text-orange-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {item.item_type === 'rice' && riceExtras.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900">Extras</legend>
            <div className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200">
              {riceExtras.map((extra) => (
                <div key={extra.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{extra.name}</p>
                    <p className="text-xs text-gray-500">{formatNaira(extra.price)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateRiceExtraQty(
                          extra.id,
                          (riceExtraQty[extra.id] || 0) - 1,
                          extra.max_quantity
                        )
                      }
                      className="h-7 w-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-sm">{riceExtraQty[extra.id] || 0}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateRiceExtraQty(
                          extra.id,
                          (riceExtraQty[extra.id] || 0) + 1,
                          extra.max_quantity
                        )
                      }
                      className="h-7 w-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {item.item_type === 'shawarma' && item.shawarma_options?.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900">Option</legend>
            <div className="flex flex-wrap gap-2">
              {item.shawarma_options
                .filter((o) => o.is_available)
                .map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => setShawarmaOptionId(String(option.id))}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                      shawarmaOptionId === String(option.id)
                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {option.name} · {formatNaira(option.price)}
                  </button>
                ))}
            </div>
          </fieldset>
        )}

        {item.item_type === 'shawarma' && shawarmaExtras.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900">Extras</legend>
            <div className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200">
              {shawarmaExtras.map((extra) => (
                <label
                  key={extra.id}
                  className="flex cursor-pointer items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{extra.name}</p>
                    <p className="text-xs text-gray-500">{formatNaira(extra.price)}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!shawarmaExtraOn[extra.id]}
                    onChange={() => toggleShawarmaExtra(extra.id)}
                    className="h-4 w-4 accent-orange-600"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {drinks.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-900">Add a drink</legend>
            <div className="flex flex-col divide-y divide-gray-100 rounded-md border border-gray-200">
              {drinks
                .filter((d) => d.is_available)
                .map((drink) => (
                  <div key={drink.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{drink.name}</p>
                      <p className="text-xs text-gray-500">{formatNaira(drink.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateDrinkQty(drink.id, (drinkQty[drink.id] || 0) - 1)}
                        className="h-7 w-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm">{drinkQty[drink.id] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateDrinkQty(drink.id, (drinkQty[drink.id] || 0) + 1)}
                        className="h-7 w-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-900">Quantity</legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-8 w-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              −
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-8 w-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </fieldset>

        <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-white py-4">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">{formatNaira(total)}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={submitting || !item.is_available}
            className="rounded-md bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
