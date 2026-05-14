import { useEffect, useState } from 'react';
import { accountsApi } from '../api/accounts.api';
import type { Account } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Plus, CreditCard, Trash2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT', 'SALARY', 'FIXED_DEPOSIT'];

const accountTypeColors: Record<string, string> = {
  SAVINGS: 'bg-blue-500/20 text-blue-400',
  CURRENT: 'bg-purple-500/20 text-purple-400',
  SALARY: 'bg-green-500/20 text-green-400',
  FIXED_DEPOSIT: 'bg-orange-500/20 text-orange-400',
};

export const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', accountNumber: '', accountType: 'SAVINGS', balance: '', currency: 'INR',
  });

  const fetchAccounts = async () => {
    try {
      const [accRes, summaryRes] = await Promise.all([
        accountsApi.getAll(),
        accountsApi.getSummary(),
      ]);
      setAccounts(accRes.data.data);
      setSummary(summaryRes.data.data);
    } catch {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await accountsApi.create({ ...form, balance: Number(form.balance) });
      toast.success('Account created!');
      setModalOpen(false);
      setForm({ name: '', accountNumber: '', accountType: 'SAVINGS', balance: '', currency: 'INR' });
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate or delete this account?')) return;
    try {
      await accountsApi.delete(id);
      toast.success('Account removed');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} linked
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Account
        </Button>
      </div>

      {/* Total balance banner */}
      {summary && (
        <Card className="bg-accent/10 border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Balance Across All Accounts</p>
              <p className="text-4xl font-bold text-accent">
                ₹{Number(summary.totalBalance).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
              <TrendingUp size={26} className="text-accent" />
            </div>
          </div>
        </Card>
      )}

      {/* Accounts grid */}
      <div className="grid grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <Card key={acc.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CreditCard size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold">{acc.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ••••{acc.accountNumber.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accountTypeColors[acc.accountType] ?? 'bg-dark-500 text-gray-400'}`}>
                  {acc.accountType}
                </span>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <p className="text-3xl font-bold tracking-tight">
              ₹{Number(acc.balance).toLocaleString('en-IN')}
            </p>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                {acc._count?.transactions ?? 0} transactions
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${acc.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {acc.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </Card>
        ))}

        {/* Empty state */}
        {accounts.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-gray-600">
            <CreditCard size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No accounts yet. Add your first account.</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Account">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Account Name"
            placeholder="HDFC Savings"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Account Number"
            placeholder="12345678901"
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Account Type</label>
            <select
              value={form.accountType}
              onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
            >
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input
            label="Opening Balance (₹)"
            type="number"
            placeholder="0"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
          />
          <Button type="submit" loading={creating} className="w-full mt-2">
            Create Account
          </Button>
        </form>
      </Modal>
    </div>
  );
};