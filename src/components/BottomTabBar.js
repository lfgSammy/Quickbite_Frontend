import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, OrdersIcon, ProfileIcon } from './icons';

export default function BottomTabBar() {
  const { user } = useAuth();
  const isStaff = user?.role === 'kitchen' || user?.role === 'admin';

  // Staff live in the queue all shift; their own customer order history is
  // not what they need one tap away. It stays reachable from Account.
  const tabs = [
    { to: '/', label: 'Home', icon: HomeIcon, end: true },
    isStaff
      ? { to: '/kitchen', label: 'Queue', icon: OrdersIcon }
      : { to: '/orders', label: 'Orders', icon: OrdersIcon },
    { to: '/account', label: 'Account', icon: ProfileIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-caption font-medium ${
                isActive ? 'text-brand-red' : 'text-gray-400'
              }`
            }
          >
            <Icon className="h-6 w-6" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
