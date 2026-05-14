import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight,
  FolderOpen, Receipt, LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/auth.store';
import PayFlowLogo from '../../assets/PayFlowLogo.png';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: CreditCard, label: 'Accounts' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/folders', icon: FolderOpen, label: 'Folders' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
];

export const Sidebar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 h-screen bg-dark-800 border-r border-[#2A2A2A] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center">
        <img
          src={PayFlowLogo}
          alt="PayFlow"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
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
                  : 'text-gray-400 hover:text-white hover:bg-dark-600'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#2A2A2A]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-dark-600 transition-all"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
};