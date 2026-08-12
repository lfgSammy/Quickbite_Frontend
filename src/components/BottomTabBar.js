import { NavLink } from 'react-router-dom';
import { HomeIcon, OrdersIcon, ProfileIcon } from './icons';

const TABS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/orders', label: 'Orders', icon: OrdersIcon },
  { to: '/account', label: 'Account', icon: ProfileIcon },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {TABS.map(({ to, label, icon: Icon, end }) => (
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
