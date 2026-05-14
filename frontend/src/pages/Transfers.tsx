import { useEffect, useState } from 'react';
import { transfersApi } from '../api/transfers.api';
import { accountsApi } from '../api/accounts.api';
import type { Transfer, Account } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Plus, ArrowRight, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Transfers = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    fromAccountId: '', toAccountId: '', amount: '', description: '',
  });

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
      setForm({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Transfer failed');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transfers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Move money between your accounts
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Transfer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">This Month</p>
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <ArrowLeftRight size={15} className="text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">
            ₹{Number(stats?.thisMonth?.totalAmount ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.thisMonth?.totalTransfers ?? 0} transfers
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">All Time</p>
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <ArrowLeftRight size={15} className="text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">
            ₹{Number(stats?.allTime?.totalAmount ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.allTime?.totalTransfers ?? 0} transfers
          </p>
        </Card>
      </div>

      {/* Transfers list */}
      <Card className="p-0 overflow-hidden">
        {transfers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <ArrowLeftRight size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No transfers yet</p>
          </div>
        )}
        {transfers.map((t, i) => (
          <div
            key={t.id}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-dark-600 transition-colors ${
              i !== transfers.length - 1 ? 'border-b border-dark-500' : ''
            }`}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <ArrowLeftRight size={17} className="text-accent" />
            </div>

            {/* From → To */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.fromAccount?.name}</span>
                <ArrowRight size={13} className="text-gray-500 flex-shrink-0" />
                <span className="text-sm font-medium">{t.toAccount?.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(t.transferredAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
                {t.description && ` · ${t.description}`}
              </p>
            </div>

            {/* Amount */}
            <p className="font-bold text-accent flex-shrink-0">
              ₹{Number(t.amount).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Transfer">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">From Account</label>
            <select
              value={form.fromAccountId}
              onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
              className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — ₹{Number(a.balance).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-dark-500 flex items-center justify-center">
              <ArrowRight size={16} className="text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">To Account</label>
            <select
              value={form.toAccountId}
              onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
              className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Amount (₹)"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            label="Description (optional)"
            placeholder="Moving to savings"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Button type="submit" loading={creating} className="w-full mt-2">
            Transfer
          </Button>
        </form>
      </Modal>
    </div>
  );
};