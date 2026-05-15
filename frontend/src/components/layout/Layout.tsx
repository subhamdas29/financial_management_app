import { Sidebar } from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { Bell, Settings, LogOut, ExternalLink, Info, X, Search, Send } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { accountsApi } from '../../api/accounts.api';
import { usersApi } from '../../api/users.api';
import { transactionsApi } from '../../api/transactions.api';
import type { Account } from '../../types';
import toast from 'react-hot-toast';

// ── Notifications Panel ────────────────────────────────────
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

// ── Settings Panel ─────────────────────────────────────────
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

// ── Profile Panel ──────────────────────────────────────────
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

// ── Search Bar ─────────────────────────────────────────────
interface SearchUser {
  id: string;
  name: string;
  email: string;
  accounts: { id: string; name: string; accountType: string; currency: string }[];
}

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [myAccounts, setMyAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // fetch my accounts once
  useEffect(() => {
    accountsApi.getAll()
      .then((res) => setMyAccounts(res.data.data))
      .catch(() => {});
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (val: string) => {
    if (val.length < 3) { setResults([]); return; }
    setSearching(true);
    try {
      const { data } = await usersApi.searchByEmail(val);
      setResults(data.data);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSelectUser = (u: SearchUser) => {
    setSelectedUser(u);
    setSelectedAccountId(u.accounts[0]?.id ?? '');
    setShowDropdown(false);
    setQuery('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedAccountId || !fromAccountId || !amount) {
      toast.error('Fill all fields');
      return;
    }
    setSending(true);
    try {
      await transactionsApi.create({
        accountId: fromAccountId,
        amount: Number(amount),
        type: 'DEBIT',
        description: description || `Sent to ${selectedUser.name}`,
        metadata: { toAccountId: selectedAccountId, toUserId: selectedUser.id },
      });
      // Also credit the receiver's account
      await transactionsApi.create({
        accountId: selectedAccountId,
        amount: Number(amount),
        type: 'CREDIT',
        description: description || `Received payment`,
      });
      toast.success(`₹${Number(amount).toLocaleString('en-IN')} sent to ${selectedUser.name}!`);
      setSelectedUser(null);
      setAmount('');
      setDescription('');
      setFromAccountId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div ref={searchRef} className="relative flex-1 max-w-lg mx-6">
        <div className="flex items-center gap-2 bg-dark-600 border border-dark-400 rounded-xl px-3 py-2">
          <Search size={15} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Search users by email..."
            className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
          />
          {searching && (
            <span className="text-gray-500 text-xs animate-spin">⟳</span>
          )}
        </div>

        {/* Dropdown results */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-11 left-0 right-0 bg-dark-700 border border-dark-500 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-dark-600 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="ml-auto text-xs text-gray-600">
                  {u.accounts.length} account{u.accounts.length !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        {showDropdown && query.length >= 3 && results.length === 0 && !searching && (
          <div className="absolute top-11 left-0 right-0 bg-dark-700 border border-dark-500 rounded-2xl shadow-2xl z-50 p-4">
            <p className="text-sm text-gray-500 text-center">No users found</p>
          </div>
        )}
      </div>

      {/* Send Money Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative bg-dark-700 border border-dark-500 rounded-2xl p-6 w-full max-w-md mx-4 z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Send Money</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl bg-dark-600 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Recipient info */}
            <div className="flex items-center gap-3 bg-dark-600 rounded-xl px-4 py-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                {selectedUser.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedUser.name}</p>
                <p className="text-xs text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleSend} className="flex flex-col gap-4">
              {/* From account */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-400">From Account</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
                >
                  <option value="">Select your account</option>
                  {myAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — ₹{Number(a.balance).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* To account */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-400">To Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
                >
                  {selectedUser.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.accountType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-400">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent placeholder-gray-600"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-400">Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. For dinner"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent placeholder-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full mt-2 bg-accent text-black font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <>
                    <Send size={16} />
                    Send ₹{amount ? Number(amount).toLocaleString('en-IN') : '0'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ── Layout ─────────────────────────────────────────────────
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

      {/* thin vertical divider */}
      <div className="fixed left-56 top-0 h-screen w-px bg-[#2A2A2A] z-20" />

      <div className="flex-1 ml-56 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 bg-[#2A2A2A] flex items-center px-6 gap-2 sticky top-0 z-20">

          {/* Search bar — center */}
          <SearchBar />

          {/* Right side icons */}
          <div className="flex items-center gap-2 ml-auto" ref={panelRef}>
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

            {/* divider */}
            <div className="w-px h-6 bg-[#3A3A3A] mx-1" />

            {/* Profile */}
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

        {/* thin horizontal divider */}
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