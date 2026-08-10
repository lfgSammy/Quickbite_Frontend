import { useEffect, useState } from 'react';
import { getMenuItems, getRiceTypes, getRiceExtras, getShawarmaExtras, getDrinks } from '../api/menu';
import * as adminApi from '../api/admin';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import BackButton from '../components/BackButton';
import { formatNaira } from '../utils/format';

function AddMenuItemForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', item_type: 'rice' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const item = await adminApi.createMenuItem(form);
      onCreated(item);
      setForm({ name: '', description: '', item_type: 'rice' });
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create this menu item.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">Add a menu item</h3>
      <ErrorMessage message={error} />

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <select
        value={form.item_type}
        onChange={(e) => setForm({ ...form, item_type: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="rice">Rice</option>
        <option value="shawarma">Shawarma</option>
      </select>

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add item'}
      </button>
    </form>
  );
}

function AddSizeForm({ menuItemId, onCreated }) {
  const [form, setForm] = useState({ name: '', price: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const size = await adminApi.createMenuItemSize(menuItemId, form);
      onCreated(size);
      setForm({ name: '', price: '' });
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add that size.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        placeholder="Size name (e.g. Regular)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="w-40 rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-800 px-3 py-1 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add size'}
      </button>
      <ErrorMessage message={error} />
    </form>
  );
}

function AddShawarmaOptionForm({ menuItemId, onCreated }) {
  const [form, setForm] = useState({ name: '', price: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const option = await adminApi.createShawarmaOption(menuItemId, {
        ...form,
        is_available: true,
      });
      onCreated(option);
      setForm({ name: '', price: '' });
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not add that option.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        placeholder="Option name (e.g. Chicken)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="w-40 rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-800 px-3 py-1 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add option'}
      </button>
      <ErrorMessage message={error} />
    </form>
  );
}

function MenuItemRow({ item, onItemUpdated }) {
  function addSize(size) {
    onItemUpdated({ ...item, sizes: [...(item.sizes || []), size] });
  }

  function addOption(option) {
    onItemUpdated({ ...item, shawarma_options: [...(item.shawarma_options || []), option] });
  }

  return (
    <li className="flex flex-col gap-2 border-b border-gray-100 py-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{item.name}</span>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-brand-red">
          {item.item_type}
        </span>
      </div>

      {item.item_type === 'rice' && (
        <div className="flex flex-col gap-2 pl-2">
          {item.sizes?.length > 0 && (
            <ul className="text-sm text-gray-500">
              {item.sizes.map((s) => (
                <li key={s.id}>
                  {s.name} — {formatNaira(s.price)}
                </li>
              ))}
            </ul>
          )}
          <AddSizeForm menuItemId={item.id} onCreated={addSize} />
        </div>
      )}

      {item.item_type === 'shawarma' && (
        <div className="flex flex-col gap-2 pl-2">
          {item.shawarma_options?.length > 0 && (
            <ul className="text-sm text-gray-500">
              {item.shawarma_options.map((o) => (
                <li key={o.id}>
                  {o.name} — {formatNaira(o.price)}
                </li>
              ))}
            </ul>
          )}
          <AddShawarmaOptionForm menuItemId={item.id} onCreated={addOption} />
        </div>
      )}
    </li>
  );
}

function SimpleCreateSection({ title, fields, initialValues, onCreate, renderItem, items }) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm(initialValues);
    } catch (err) {
      setError(extractErrorMessage(err, `Could not add this ${title.toLowerCase()}.`));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-gray-200 p-4">
      <h3 className="mb-3 font-semibold text-gray-900">{title}</h3>

      {items.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1 text-sm text-gray-500">
          {items.map(renderItem)}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        {fields.map((field) => (
          <input
            key={field.name}
            type={field.type || 'text'}
            step={field.type === 'number' ? '0.01' : undefined}
            min={field.type === 'number' ? '0' : undefined}
            placeholder={field.label}
            value={form[field.name]}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            required={field.required !== false}
            className="w-36 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ))}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-800 px-3 py-1 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {submitting ? 'Adding…' : 'Add'}
        </button>
      </form>
      <ErrorMessage message={error} />
    </div>
  );
}

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [riceTypes, setRiceTypes] = useState([]);
  const [riceExtras, setRiceExtras] = useState([]);
  const [shawarmaExtras, setShawarmaExtras] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMenuItems(), getRiceTypes(), getRiceExtras(), getShawarmaExtras(), getDrinks()])
      .then(([itemsData, riceTypesData, riceExtrasData, shawarmaExtrasData, drinksData]) => {
        setItems(itemsData);
        setRiceTypes(riceTypesData);
        setRiceExtras(riceExtrasData);
        setShawarmaExtras(shawarmaExtrasData);
        setDrinks(drinksData);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load menu data.')))
      .finally(() => setLoading(false));
  }, []);

  function handleItemCreated(item) {
    setItems((prev) => [...prev, item]);
  }

  function handleItemUpdated(updatedItem) {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  }

  if (loading) return <Spinner label="Loading admin panel…" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-2xl font-bold text-gray-900">Menu Admin</h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Add menu items, then give rice items a size or shawarma items an option so customers
        can order them.
      </p>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">
        <AddMenuItemForm onCreated={handleItemCreated} />

        <div className="rounded-md border border-gray-200 p-4">
          <h3 className="mb-1 font-semibold text-gray-900">Menu items</h3>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No menu items yet.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <MenuItemRow key={item.id} item={item} onItemUpdated={handleItemUpdated} />
              ))}
            </ul>
          )}
        </div>

        <SimpleCreateSection
          title="Rice types"
          items={riceTypes}
          renderItem={(t) => <li key={t.id}>{t.name}</li>}
          fields={[{ name: 'name', label: 'Name' }]}
          initialValues={{ name: '' }}
          onCreate={async (form) => {
            const created = await adminApi.createRiceType(form);
            setRiceTypes((prev) => [...prev, created]);
          }}
        />

        <SimpleCreateSection
          title="Rice extras"
          items={riceExtras}
          renderItem={(e) => (
            <li key={e.id}>
              {e.name} — {formatNaira(e.price)} (max {e.max_quantity})
            </li>
          )}
          fields={[
            { name: 'name', label: 'Name' },
            { name: 'price', label: 'Price', type: 'number' },
            { name: 'max_quantity', label: 'Max qty', type: 'number' },
          ]}
          initialValues={{ name: '', price: '', max_quantity: '5' }}
          onCreate={async (form) => {
            const created = await adminApi.createRiceExtra(form);
            setRiceExtras((prev) => [...prev, created]);
          }}
        />

        <SimpleCreateSection
          title="Shawarma extras"
          items={shawarmaExtras}
          renderItem={(e) => (
            <li key={e.id}>
              {e.name} — {formatNaira(e.price)}
            </li>
          )}
          fields={[
            { name: 'name', label: 'Name' },
            { name: 'price', label: 'Price', type: 'number' },
          ]}
          initialValues={{ name: '', price: '' }}
          onCreate={async (form) => {
            const created = await adminApi.createShawarmaExtra(form);
            setShawarmaExtras((prev) => [...prev, created]);
          }}
        />

        <SimpleCreateSection
          title="Drinks"
          items={drinks}
          renderItem={(d) => (
            <li key={d.id}>
              {d.name} — {formatNaira(d.price)}
            </li>
          )}
          fields={[
            { name: 'name', label: 'Name' },
            { name: 'price', label: 'Price', type: 'number' },
          ]}
          initialValues={{ name: '', price: '' }}
          onCreate={async (form) => {
            const created = await adminApi.createDrink(form);
            setDrinks((prev) => [...prev, created]);
          }}
        />
      </div>
    </div>
  );
}
