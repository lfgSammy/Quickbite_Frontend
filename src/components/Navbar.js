import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 bg-orange-600 text-white shadow">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight">
          QuickBite
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-orange-100">
            Menu
          </Link>

          {isAuthenticated && (
            <Link to="/orders" className="hover:text-orange-100">
              My Orders
            </Link>
          )}

          <Link to="/cart" className="relative hover:text-orange-100">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-orange-600">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-orange-100 sm:inline">
                Hi, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-orange-700 px-3 py-1.5 hover:bg-orange-800"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 hover:bg-orange-700"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-white px-3 py-1.5 font-semibold text-orange-600 hover:bg-orange-100"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
