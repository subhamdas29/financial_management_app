import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight,
  FolderOpen, Receipt, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import clsx from 'clsx';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: CreditCard, label: 'Accounts' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/folders', icon: FolderOpen, label: 'Folders' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
];

export const Sidebar = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-dark-800 border-r border-dark-600 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-dark-600">
        <span className="text-xl font-bold">
          Pay<span className="text-accent">Flow</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-accent text-black'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-dark-600">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};