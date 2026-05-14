import { useEffect, useState } from 'react';
import { transactionsApi } from '../api/transactions.api';
import { foldersApi } from '../api/folders.api';
import { accountsApi } from '../api/accounts.api';
import type { Transaction, Folder, Account } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({
    accountId: '', folderId: '', amount: '',
    type: 'DEBIT', description: '', merchant: '',
  });

  const fetchAll = async () => {
    try {
      const [txRes, folderRes, accRes] = await Promise.all([
        transactionsApi.getAll({ type: filterType || undefined, limit: 20 }),
        foldersApi.getAll(),
        accountsApi.getAll(),
      ]);
      setTransactions(txRes.data.data.transactions);
      setFolders(folderRes.data.data);
      setAccounts(accRes.data.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [filterType]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await transactionsApi.create({
        ...form,
        amount: Number(form.amount),
        folderId: form.folderId || undefined,
      });
      toast.success('Transaction added!');
      setModalOpen(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          {['', 'CREDIT', 'DEBIT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filterType === type
                  ? 'bg-accent text-black'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-3">
          {transactions.length === 0 && (
            <p className="text-gray-600 text-sm">No transactions found</p>
          )}
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
              <div>
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-gray-500">
                  {tx.merchant} · {new Date(tx.transactedAt).toLocaleDateString('en-IN')}
                </p>
                {tx.folder && <Badge label={tx.folder.name} variant="gray" />}
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'CREDIT' ? 'text-accent' : 'text-red-400'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500">{tx.account?.name}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Transaction">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Account</label>
            <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent">
              <option value="">Select account</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            {['DEBIT', 'CREDIT'].map((t) => (
              <button type="button" key={t} onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  form.type === t ? 'bg-accent text-black' : 'bg-dark-700 text-gray-400'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <Input label="Amount" type="number" placeholder="0" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Description" placeholder="Groceries at DMart" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Merchant (optional)" placeholder="DMart" value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Folder (optional)</label>
            <select value={form.folderId} onChange={(e) => setForm({ ...form, folderId: e.target.value })}
              className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent">
              <option value="">No folder</option>
              {folders.map((f) => <option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}
            </select>
          </div>
          <Button type="submit" loading={creating} className="w-full mt-2">Add Transaction</Button>
        </form>
      </Modal>
    </div>
  );
};