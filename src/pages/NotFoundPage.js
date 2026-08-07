import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-gray-500">This page doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block text-orange-600 hover:underline">
        Back to menu
      </Link>
    </div>
  );
}
