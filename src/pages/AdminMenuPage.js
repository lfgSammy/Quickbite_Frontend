import { useEffect, useRef, useState } from 'react';
import { getMenuItems, getRiceTypes, getRiceExtras, getShawarmaExtras, getDrinks } from '../api/menu';
import * as adminApi from '../api/admin';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import BackButton from '../components/BackButton';
import { MoreIcon } from '../components/icons';
import { formatNaira } from '../utils/format';

function buildMenuItemPayload(fields) {
  if (!(fields.image instanceof File)) {
    const { image, ...rest } = fields;
    return rest;
  }
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });
  return formData;
}

function ActionsMenu({ onEdit, onDelete, deleting }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Item actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
      >
        <MoreIcon className="h-5 w-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-10 w-32 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="block w-full px-3 py-2 text-left text-body-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={deleting}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="block w-full px-3 py-2 text-left text-body-sm text-brand-red hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}

function EditableFieldsRow({ item, fields, renderLabel, onSave, onDelete, variant = 'menu' }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, item[field.name] ?? '']))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSave(item.id, form);
      setEditing(false);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save changes.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setError('');
    setDeleting(true);
    try {
      await onDelete(item.id);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete this item.'));
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <li className="border-b border-gray-100 py-2 last:border-b-0">
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
              required
              className="w-28 rounded-md border border-gray-300 px-2 py-1 text-input"
            />
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-800 px-3 py-1 text-btn-sm text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-gray-300 px-3 py-1 text-btn-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </form>
        <ErrorMessage message={error} />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 border-b border-gray-100 py-2 last:border-b-0">
      <div className="flex-1">
        <span>{renderLabel(item)}</span>
        <ErrorMessage message={error} />
      </div>
      {variant === 'menu' ? (
        <ActionsMenu onEdit={() => setEditing(true)} onDelete={handleDelete} deleting={deleting} />
      ) : (
        <div className="flex shrink-0 items-center gap-3 text-caption font-medium">
          <button type="button" onClick={() => setEditing(true)} className="text-gray-600 hover:underline">
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-brand-red hover:underline disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </li>
  );
}

function AddMenuItemForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    item_type: 'rice',
    is_available: true,
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0] || null;
    setForm((f) => ({ ...f, image: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const item = await adminApi.createMenuItem(buildMenuItemPayload(form));
      onCreated(item);
      setForm({ name: '', description: '', item_type: 'rice', is_available: true, image: null });
      setPreview(null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create this menu item.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
      <h3 className="text-h4 text-gray-900">Add a menu item</h3>
      <ErrorMessage message={error} />

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-input"
      />
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-input"
      />
      <select
        value={form.item_type}
        onChange={(e) => setForm({ ...form, item_type: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-input"
      >
        <option value="rice">Rice</option>
        <option value="shawarma">Shawarma</option>
      </select>

      <label className="flex flex-col gap-1 text-label text-gray-600">
        Photo
        {preview && (
          <img src={preview} alt="" className="h-24 w-24 rounded-md object-cover" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-input" />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-brand-red px-4 py-2 text-btn-sm text-white hover:bg-brand-red-dark disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add item'}
      </button>
    </form>
  );
}

function EditMenuItemForm({ item, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: item.name,
    description: item.description || '',
    item_type: item.item_type,
    is_available: item.is_available,
    image: null,
  });
  const [preview, setPreview] = useState(item.image_url || null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0] || null;
    setForm((f) => ({ ...f, image: file }));
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const updated = await adminApi.updateMenuItem(item.id, buildMenuItemPayload(form));
      onSaved(updated);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save changes.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md bg-gray-50 p-3">
      <ErrorMessage message={error} />

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-input"
      />
      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-input"
      />
      <select
        value={form.item_type}
        onChange={(e) => setForm({ ...form, item_type: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-input"
      >
        <option value="rice">Rice</option>
        <option value="shawarma">Shawarma</option>
      </select>

      <label className="flex items-center gap-2 text-label text-gray-700">
        <input
          type="checkbox"
          checked={form.is_available}
          onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
          className="h-4 w-4 accent-brand-red"
        />
        Available to customers
      </label>

      <label className="flex flex-col gap-1 text-label text-gray-600">
        Photo
        {preview && (
          <img src={preview} alt="" className="h-24 w-24 rounded-md object-cover" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-input" />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-red px-4 py-1.5 text-btn-sm text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-btn-sm text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
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
        className="w-40 rounded-md border border-gray-300 px-2 py-1 text-input"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-input"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-800 px-3 py-1 text-btn-sm text-white hover:bg-gray-900 disabled:opacity-60"
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
        className="w-40 rounded-md border border-gray-300 px-2 py-1 text-input"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-input"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-800 px-3 py-1 text-btn-sm text-white hover:bg-gray-900 disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add option'}
      </button>
      <ErrorMessage message={error} />
    </form>
  );
}

function MenuItemRow({ item, onItemUpdated, onItemDeleted }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  function addSize(size) {
    onItemUpdated({ ...item, sizes: [...(item.sizes || []), size] });
  }

  function replaceSize(updated) {
    onItemUpdated({
      ...item,
      sizes: (item.sizes || []).map((s) => (s.id === updated.id ? updated : s)),
    });
  }

  function removeSize(sizeId) {
    onItemUpdated({ ...item, sizes: (item.sizes || []).filter((s) => s.id !== sizeId) });
  }

  function addOption(option) {
    onItemUpdated({ ...item, shawarma_options: [...(item.shawarma_options || []), option] });
  }

  function replaceOption(updated) {
    onItemUpdated({
      ...item,
      shawarma_options: (item.shawarma_options || []).map((o) => (o.id === updated.id ? updated : o)),
    });
  }

  function removeOption(optionId) {
    onItemUpdated({
      ...item,
      shawarma_options: (item.shawarma_options || []).filter((o) => o.id !== optionId),
    });
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await adminApi.deleteMenuItem(item.id);
      onItemDeleted(item.id);
    } catch (err) {
      setDeleteError(extractErrorMessage(err, 'Could not delete this item.'));
      setDeleting(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 border-b border-gray-100 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {item.image_url && (
            <img src={item.image_url} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
          )}
          <span className="truncate text-body font-medium text-gray-900">{item.name}</span>
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-caption font-medium text-brand-red">
            {item.item_type}
          </span>
        </div>
        <ActionsMenu onEdit={() => setEditing(true)} onDelete={handleDelete} deleting={deleting} />
      </div>

      {editing && (
        <EditMenuItemForm
          item={item}
          onSaved={(updated) => {
            onItemUpdated(updated);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}
      <ErrorMessage message={deleteError} />
      {!editing && !item.is_available && (
        <span className="text-caption font-medium text-gray-400">Hidden from customers</span>
      )}

      {item.item_type === 'rice' && (
        <div className="flex flex-col gap-2 pl-2">
          {item.sizes?.length > 0 && (
            <ul className="text-body-sm text-gray-500">
              {item.sizes.map((s) => (
                <EditableFieldsRow
                  key={s.id}
                  item={s}
                  fields={[
                    { name: 'name', label: 'Size name' },
                    { name: 'price', label: 'Price', type: 'number' },
                  ]}
                  renderLabel={(size) => `${size.name} — ${formatNaira(size.price)}`}
                  onSave={async (id, form) => replaceSize(await adminApi.updateMenuItemSize(id, form))}
                  onDelete={async (id) => {
                    await adminApi.deleteMenuItemSize(id);
                    removeSize(id);
                  }}
                  variant="inline"
                />
              ))}
            </ul>
          )}
          <AddSizeForm menuItemId={item.id} onCreated={addSize} />
        </div>
      )}

      {item.item_type === 'shawarma' && (
        <div className="flex flex-col gap-2 pl-2">
          {item.shawarma_options?.length > 0 && (
            <ul className="text-body-sm text-gray-500">
              {item.shawarma_options.map((o) => (
                <EditableFieldsRow
                  key={o.id}
                  item={o}
                  fields={[
                    { name: 'name', label: 'Option name' },
                    { name: 'price', label: 'Price', type: 'number' },
                  ]}
                  renderLabel={(option) => `${option.name} — ${formatNaira(option.price)}`}
                  onSave={async (id, form) => replaceOption(await adminApi.updateShawarmaOption(id, form))}
                  onDelete={async (id) => {
                    await adminApi.deleteShawarmaOption(id);
                    removeOption(id);
                  }}
                  variant="inline"
                />
              ))}
            </ul>
          )}
          <AddShawarmaOptionForm menuItemId={item.id} onCreated={addOption} />
        </div>
      )}
    </li>
  );
}

function SimpleCreateSection({ title, fields, initialValues, onCreate, onUpdate, onDelete, renderLabel, items }) {
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
      <h3 className="mb-3 text-h4 text-gray-900">{title}</h3>

      {items.length > 0 && (
        <ul className="mb-3 flex flex-col text-body-sm text-gray-500">
          {items.map((item) => (
            <EditableFieldsRow
              key={item.id}
              item={item}
              fields={fields}
              renderLabel={renderLabel}
              onSave={onUpdate}
              onDelete={onDelete}
            />
          ))}
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
            className="w-36 rounded-md border border-gray-300 px-2 py-1 text-input"
          />
        ))}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-800 px-3 py-1 text-btn-sm text-white hover:bg-gray-900 disabled:opacity-60"
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

  function handleItemDeleted(itemId) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  if (loading) return <Spinner label="Loading admin panel…" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-h1 text-gray-900">Menu Admin</h1>
      </div>
      <p className="mt-1 text-body-sm text-gray-500">
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
          <h3 className="mb-1 text-h4 text-gray-900">Menu items</h3>
          {items.length === 0 ? (
            <p className="text-body-sm text-gray-500">No menu items yet.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  onItemUpdated={handleItemUpdated}
                  onItemDeleted={handleItemDeleted}
                />
              ))}
            </ul>
          )}
        </div>

        <SimpleCreateSection
          title="Rice types"
          items={riceTypes}
          renderLabel={(t) => t.name}
          fields={[{ name: 'name', label: 'Name' }]}
          initialValues={{ name: '' }}
          onCreate={async (form) => {
            const created = await adminApi.createRiceType(form);
            setRiceTypes((prev) => [...prev, created]);
          }}
          onUpdate={async (id, form) => {
            const updated = await adminApi.updateRiceType(id, form);
            setRiceTypes((prev) => prev.map((t) => (t.id === id ? updated : t)));
          }}
          onDelete={async (id) => {
            await adminApi.deleteRiceType(id);
            setRiceTypes((prev) => prev.filter((t) => t.id !== id));
          }}
        />

        <SimpleCreateSection
          title="Extras"
          items={riceExtras}
          renderLabel={(e) => `${e.name} — ${formatNaira(e.price)} (max ${e.max_quantity})`}
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
          onUpdate={async (id, form) => {
            const updated = await adminApi.updateRiceExtra(id, form);
            setRiceExtras((prev) => prev.map((e) => (e.id === id ? updated : e)));
          }}
          onDelete={async (id) => {
            await adminApi.deleteRiceExtra(id);
            setRiceExtras((prev) => prev.filter((e) => e.id !== id));
          }}
        />

        <SimpleCreateSection
          title="Extras"
          items={shawarmaExtras}
          renderLabel={(e) => `${e.name} — ${formatNaira(e.price)}`}
          fields={[
            { name: 'name', label: 'Name' },
            { name: 'price', label: 'Price', type: 'number' },
          ]}
          initialValues={{ name: '', price: '' }}
          onCreate={async (form) => {
            const created = await adminApi.createShawarmaExtra(form);
            setShawarmaExtras((prev) => [...prev, created]);
          }}
          onUpdate={async (id, form) => {
            const updated = await adminApi.updateShawarmaExtra(id, form);
            setShawarmaExtras((prev) => prev.map((e) => (e.id === id ? updated : e)));
          }}
          onDelete={async (id) => {
            await adminApi.deleteShawarmaExtra(id);
            setShawarmaExtras((prev) => prev.filter((e) => e.id !== id));
          }}
        />

        <SimpleCreateSection
          title="Drinks"
          items={drinks}
          renderLabel={(d) => `${d.name} — ${formatNaira(d.price)}`}
          fields={[
            { name: 'name', label: 'Name' },
            { name: 'price', label: 'Price', type: 'number' },
          ]}
          initialValues={{ name: '', price: '' }}
          onCreate={async (form) => {
            const created = await adminApi.createDrink(form);
            setDrinks((prev) => [...prev, created]);
          }}
          onUpdate={async (id, form) => {
            const updated = await adminApi.updateDrink(id, form);
            setDrinks((prev) => prev.map((d) => (d.id === id ? updated : d)));
          }}
          onDelete={async (id) => {
            await adminApi.deleteDrink(id);
            setDrinks((prev) => prev.filter((d) => d.id !== id));
          }}
        />
      </div>
    </div>
  );
}
