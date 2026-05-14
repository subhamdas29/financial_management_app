import { Sidebar } from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { Bell, Settings, LogOut, ExternalLink, Info, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { accountsApi } from '../../api/accounts.api';
import type { Account } from '../../types';

const NotificationsPanel = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="absolute right-0 top-12 w-80 bg-dark-700 border border-dark-500 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-500">
        <span className="font-semibold text-sm">Notifications</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 text-center py-4">
          No new notifications
        </p>
      </div>
    </div>
  );
};

const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="absolute right-0 top-12 w-72 bg-dark-700 border border-dark-500 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-500">
        <span className="font-semibold text-sm">Settings</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {showAbout ? (
        <div className="p-4 space-y-3">
          <button
            onClick={() => setShowAbout(false)}
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
          >
            ← Back
          </button>
          <h3 className="font-semibold text-sm">About PayFlow</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            PayFlow is a full-stack financial management app built with Node.js,
            Express, TypeScript, Prisma, PostgreSQL, Socket.IO, and React.
            It supports multiple bank accounts, real-time transactions, folder-based
            expense tracking, budget limits, and account-to-account transfers.
          </p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        </div>
      ) : (
        <div className="p-2">
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-dark-600 hover:text-white transition-colors"
          >
            <Info size={16} className="text-accent" />
            About PayFlow
          </button>
          <a
            href="https://github.com/subhamdas29/Financial_management_app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-dark-600 hover:text-white transition-colors"
          >
            <ExternalLink size={16} className="text-accent" />
            Open on GitHub
          </a>
          <div className="border-t border-dark-500 my-1" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-dark-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const ProfilePanel = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    accountsApi.getAll()
      .then((res) => setAccounts(res.data.data))
      .catch(() => {});
  }, []);

  return (
    <div className="absolute right-0 top-12 w-80 bg-dark-700 border border-dark-500 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-500">
        <span className="font-semibold text-sm">My Profile</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-black font-bold text-lg">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase mb-2">
            Linked Accounts
          </p>
          {accounts.length === 0 && (
            <p className="text-xs text-gray-600">No accounts linked</p>
          )}
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between bg-dark-600 rounded-xl px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{acc.name}</p>
                  <p className="text-xs text-gray-500">
                    ••••{acc.accountNumber.slice(-4)} · {acc.accountType}
                  </p>
                </div>
                <p className="text-sm font-bold text-accent">
                  ₹{Number(acc.balance).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Layout = () => {
  useSocket();
  const { user } = useAuthStore();
  const [openPanel, setOpenPanel] = useState<'notifications' | 'settings' | 'profile' | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggle = (panel: 'notifications' | 'settings' | 'profile') => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-dark-800">
      <Sidebar />

      {/* thin vertical divider between sidebar and content */}
      <div className="fixed left-56 top-0 h-screen w-px bg-[#2A2A2A] z-20" />

      <div className="flex-1 ml-56 flex flex-col">
        {/* Top Navbar — matches dashboard header card color */}
        <header className="h-14 bg-[#2A2A2A] flex items-center justify-end px-6 gap-2 sticky top-0 z-20">
          <div className="flex items-center gap-1" ref={panelRef}>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => toggle('notifications')}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  openPanel === 'notifications'
                    ? 'bg-accent text-black'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600'
                }`}
              >
                <Bell size={18} />
              </button>
              {openPanel === 'notifications' && (
                <NotificationsPanel onClose={() => setOpenPanel(null)} />
              )}
            </div>

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => toggle('settings')}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  openPanel === 'settings'
                    ? 'bg-accent text-black'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600'
                }`}
              >
                <Settings size={18} />
              </button>
              {openPanel === 'settings' && (
                <SettingsPanel onClose={() => setOpenPanel(null)} />
              )}
            </div>

            {/* thin vertical divider before profile */}
            <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

            {/* Profile — lighter grey */}
            <div className="relative">
              <button
                onClick={() => toggle('profile')}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  openPanel === 'profile'
                    ? 'bg-accent text-black'
                    : 'bg-[#4A4A4A] text-white hover:bg-[#555555]'
                }`}
              >
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </button>
              {openPanel === 'profile' && (
                <ProfilePanel onClose={() => setOpenPanel(null)} />
              )}
            </div>
          </div>
        </header>

        {/* thin horizontal divider below navbar */}
        <div className="w-full h-px bg-[#2A2A2A]" />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#222222',
            color: '#fff',
            border: '1px solid #3A3A3A',
          },
        }}
      />
    </div>
  );
};