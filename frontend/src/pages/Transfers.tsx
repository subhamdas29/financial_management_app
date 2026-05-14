import { useEffect, useState } from 'react';
import { transfersApi } from '../api/transfers.api';
import { accountsApi } from '../api/accounts.api';
import type { Transfer, Account } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Transfers = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ fromAccountId: '', toAccountId: '', amount: '', description: '' });

  const fetchAll = async () => {
    try {
      const [txRes, accRes, statsRes] = await Promise.all([
        transfersApi.getAll(),
        accountsApi.getAll(),
        transfersApi.getStats(),
      ]);
      setTransfers(txRes.data.data.transfers);
      setAccounts(accRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await transfersApi.create({ ...form, amount: Number(form.amount) });
      toast.success('Transfer completed!');
      setModalOpen(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Transfer failed');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transfers</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-gray-400 text-sm mb-1">This Month</p>
          <p className="text-2xl font-bold">
            ₹{Number(stats?.thisMonth?.totalAmount ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">{stats?.thisMonth?.totalTransfers ?? 0} transfers</p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm mb-1">All Time</p>
          <p className="text-2xl font-bold">
            ₹{Number(stats?.allTime?.totalAmount ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">{stats?.allTime?.totalTransfers ?? 0} transfers</p>
        </Card>
      </div>

      <Card>
        <div className="space-y-3">
          {transfers.length === 0 && (
            <p className="text-gray-600 text-sm">No transfers yet</p>
          )}
          {transfers.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <p className="font-medium">{t.fromAccount?.name}</p>
                  <p className="text-xs text-gray-500">{new Date(t.transferredAt).toLocaleDateString('en-IN')}</p>
                </div>
                <ArrowRight size={14} className="text-gray-500" />
                <p className="text-sm font-medium">{t.toAccount?.name}</p>
              </div>
              <p className="font-semibold text-accent">
                ₹{Number(t.amount).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Transfer">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">From Account</label>
            <select value={form.fromAccountId} onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
              className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent">
              <option value="">Select account</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} — ₹{Number(a.balance).toLocaleString('en-IN')}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">To Account</label>
            <select value={form.toAccountId} onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
              className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent">
              <option value="">Select account</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <Input label="Amount" type="number" placeholder="0" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Description (optional)" placeholder="Moving to savings" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" loading={creating} className="w-full mt-2">Transfer</Button>
        </form>
      </Modal>
    </div>
  );
};