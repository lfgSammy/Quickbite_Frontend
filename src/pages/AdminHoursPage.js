import { useEffect, useState } from 'react';
import { getOperatingHours } from '../api/auth';
import { setOperatingHours } from '../api/admin';
import Spinner from '../components/Spinner';
import ErrorMessage, { extractErrorMessage } from '../components/ErrorMessage';
import BackButton from '../components/BackButton';

const DAYS = [
  { index: 0, name: 'Monday' },
  { index: 1, name: 'Tuesday' },
  { index: 2, name: 'Wednesday' },
  { index: 3, name: 'Thursday' },
  { index: 4, name: 'Friday' },
  { index: 5, name: 'Saturday' },
  { index: 6, name: 'Sunday' },
];

function DayRow({ day, initial, onSaved }) {
  const [openTime, setOpenTime] = useState(initial?.open_time?.slice(0, 5) || '09:00');
  const [closeTime, setCloseTime] = useState(initial?.close_time?.slice(0, 5) || '18:00');
  const [isOpen, setIsOpen] = useState(initial?.is_open ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      const saved = await setOperatingHours({
        day: day.index,
        open_time: openTime,
        close_time: closeTime,
        is_open: isOpen,
      });
      onSaved(saved);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save these hours.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-brand-black">{day.name}</p>
        <label className="flex items-center gap-2 text-sm text-gray-500">
          Open
          <input
            type="checkbox"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
            className="h-4 w-4 accent-brand-red"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="time"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
          disabled={!isOpen}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
        />
        <span className="text-gray-400">to</span>
        <input
          type="time"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          disabled={!isOpen}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:opacity-50"
        />
      </div>

      {error && (
        <div className="mt-2">
          <ErrorMessage message={error} />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 w-full rounded-full bg-brand-black py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

export default function AdminHoursPage() {
  const [hoursByDay, setHoursByDay] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOperatingHours()
      .then((data) => {
        const byName = {};
        data.forEach((h) => {
          byName[h.day] = h;
        });
        setHoursByDay(byName);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load operating hours.')))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(saved) {
    setHoursByDay((prev) => ({ ...prev, [saved.day]: saved }));
  }

  if (loading) return <Spinner label="Loading operating hours…" />;

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-2xl font-extrabold text-brand-black">Operating Hours</h1>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Customers can only book pickup times within these hours.
      </p>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {DAYS.map((day) => (
          <DayRow key={day.index} day={day} initial={hoursByDay[day.name]} onSaved={handleSaved} />
        ))}
      </div>
    </div>
  );
}
