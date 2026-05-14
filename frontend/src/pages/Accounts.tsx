import { useEffect, useState } from 'react';
import { accountsApi } from '../api/accounts.api';
import type { Account } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { Plus, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT', 'SALARY', 'FIXED_DEPOSIT'];

export const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', accountNumber: '', accountType: 'SAVINGS', balance: '', currency: 'INR',
  });

  const fetchAccounts = async () => {
    try {
      const { data } = await accountsApi.getAll();
      setAccounts(data.data);
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">{accounts.length} accounts linked</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Account
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <Card key={acc.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CreditCard size={18} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold">{acc.name}</p>
                  <p className="text-xs text-gray-500">••••{acc.accountNumber.slice(-4)}</p>
                </div>
              </div>
              <Badge
                label={acc.accountType}
                variant={acc.isActive ? 'green' : 'gray'}
              />
            </div>
            <p className="text-3xl font-bold">
              ₹{Number(acc.balance).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acc._count?.transactions ?? 0} transactions
            </p>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Account">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Account Name" placeholder="HDFC Savings" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Account Number" placeholder="12345678901" value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Account Type</label>
            <select
              value={form.accountType}
              onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
            >
              {ACCOUNT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Opening Balance" type="number" placeholder="0" value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })} />
          <Button type="submit" loading={creating} className="w-full mt-2">
            Create Account
          </Button>
        </form>
      </Modal>
    </div>
  );
};