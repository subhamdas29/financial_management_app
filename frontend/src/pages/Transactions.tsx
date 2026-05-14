import { useEffect, useState } from 'react';
import { transactionsApi } from '../api/transactions.api';
import { foldersApi } from '../api/folders.api';
import { accountsApi } from '../api/accounts.api';
import type { Transaction, Folder, Account } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Plus, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const TxIcon = ({ type }: { type: 'CREDIT' | 'DEBIT' }) => (
  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
    type === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'
  }`}>
    {type === 'CREDIT'
      ? <TrendingUp size={17} className="text-green-400" />
      : <TrendingDown size={17} className="text-red-400" />
    }
  </div>
);

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
      setForm({ accountId: '', folderId: '', amount: '', type: 'DEBIT', description: '', merchant: '' });
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
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
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {transactions.length} transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter pills */}
          <div className="flex bg-dark-700 rounded-xl p-1 gap-1">
            {['', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === type
                    ? 'bg-accent text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type || 'All'}
              </button>
            ))}
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      {/* Transactions list */}
      <Card className="p-0 overflow-hidden">
        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <Receipt size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No transactions found</p>
          </div>
        )}
        {transactions.map((tx, i) => (
          <div
            key={tx.id}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-dark-600 transition-colors ${
              i !== transactions.length - 1 ? 'border-b border-dark-500' : ''
            }`}
          >
            <TxIcon type={tx.type} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {tx.merchant && (
                  <span className="text-xs text-gray-500">{tx.merchant}</span>
                )}
                {tx.merchant && <span className="text-gray-600 text-xs">·</span>}
                <span className="text-xs text-gray-500">
                  {new Date(tx.transactedAt).toLocaleDateString('en-IN')}
                </span>
                {tx.folder && (
                  <>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-xs bg-dark-500 text-gray-400 px-2 py-0.5 rounded-full">
                      {tx.folder.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold ${
                tx.type === 'CREDIT' ? 'text-accent' : 'text-red-400'
              }`}>
                {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{tx.account?.name}</p>
            </div>
          </div>
        ))}
      </Card>

      {/* Add Transaction Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Transaction">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Account</label>
            <select
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-dark-600 rounded-xl p-1 gap-1">
            {['DEBIT', 'CREDIT'].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  form.type === t ? 'bg-accent text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Input
            label="Amount (₹)"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Groceries at DMart"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Merchant (optional)"
            placeholder="DMart"
            value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Folder (optional)</label>
            <select
              value={form.folderId}
              onChange={(e) => setForm({ ...form, folderId: e.target.value })}
              className="bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-accent"
            >
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={creating} className="w-full mt-2">
            Add Transaction
          </Button>
        </form>
      </Modal>
    </div>
  );
};