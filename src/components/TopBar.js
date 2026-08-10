import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartIcon } from './icons';

export default function TopBar() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
      <Link to="/" aria-label="QuickBite" className="flex items-baseline gap-1.5">
        <span className="text-xl font-extrabold tracking-tight text-brand-black">
          Quick<span className="text-brand-red">Bite</span>
        </span>
        <span className="text-xs font-semibold tracking-widest text-gray-400">PICKUP</span>
      </Link>

      <Link to="/cart" className="relative rounded-full border border-gray-200 p-2 text-brand-black">
        <CartIcon className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </Link>
    </header>
  );
}
