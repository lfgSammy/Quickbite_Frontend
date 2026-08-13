import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="px-4 py-24 text-center">
      <h1 className="text-display text-brand-black">404</h1>
      <p className="mt-2 text-body text-gray-500">This page doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block font-semibold text-brand-red">
        Back to menu
      </Link>
    </div>
  );
}
