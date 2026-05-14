import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight,
  FolderOpen, Receipt,
} from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: CreditCard, label: 'Accounts' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/folders', icon: FolderOpen, label: 'Folders' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
];

export const Sidebar = () => {
  return (
    <aside className="w-56 h-screen bg-dark-800 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
          <CreditCard size={18} className="text-black" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          Pay<span className="text-accent">Flow</span>
        </span>
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
    </aside>
  );
};