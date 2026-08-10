import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './icons';

export default function BackButton({ fallback = '/account' }) {
  const navigate = useNavigate();

  function handleClick() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-brand-black hover:bg-gray-50"
    >
      <ChevronLeftIcon className="h-5 w-5" />
    </button>
  );
}
