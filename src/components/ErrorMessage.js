export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700">
      {message}
    </div>
  );
}

export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') {
    // Never show a raw server error page (HTML) to the user, whatever caused it.
    if (data.trim().startsWith('<')) return fallback;
    return data;
  }
  if (data.error) {
    return Array.isArray(data.error) ? data.error.join(' ') : data.error;
  }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    return Array.isArray(value) ? value.join(' ') : String(value);
  }
  return fallback;
}
