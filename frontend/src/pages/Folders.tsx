import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foldersApi } from '../api/folders.api';
// import type{ Folder } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const Folders = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'EXPENSE', icon: '', budgetLimit: '', color: '#CCFF00',
  });

  const fetchFolders = async () => {
    try {
      const { data } = await foldersApi.getSummary();
      setFolders(data.data);
    } catch {
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFolders(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await foldersApi.create({
        ...form,
        budgetLimit: form.budgetLimit ? Number(form.budgetLimit) : undefined,
      });
      toast.success('Folder created!');
      setModalOpen(false);
      fetchFolders();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader />;

  const income = folders.filter((f) => f.type === 'INCOME');
  const expense = folders.filter((f) => f.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Folders</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Folder
        </Button>
      </div>

      {/* Income folders */}
      {income.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">INCOME</h2>
          <div className="grid grid-cols-3 gap-4">
            {income.map((f) => (
              <Card key={f.id} onClick={() => navigate(`/folders/${f.id}`)}>
                <div className="text-2xl mb-2">{f.icon || '📁'}</div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-accent font-bold mt-2">
                  ₹{Number(f.monthlySpent).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500">this month</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Expense folders */}
      {expense.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">EXPENSE</h2>
          <div className="grid grid-cols-3 gap-4">
            {expense.map((f) => (
              <Card key={f.id} onClick={() => navigate(`/folders/${f.id}`)}>
                <div className="text-2xl mb-2">{f.icon || '📁'}</div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-red-400 font-bold mt-2">
                  ₹{Number(f.monthlySpent).toLocaleString('en-IN')}
                </p>
                {f.budgetLimit && (
                  <div className="mt-2">
                    <div className="w-full bg-dark-600 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${f.isOverBudget ? 'bg-red-500' : 'bg-accent'}`}
                        style={{ width: `${Math.min((f.monthlySpent / f.budgetLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      of ₹{Number(f.budgetLimit).toLocaleString('en-IN')} budget
                    </p>
                  </div>
                )}
                {f.isOverBudget && <Badge label="Over Budget" variant="red" />}
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Folder">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Folder Name" placeholder="Food" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="flex gap-2">
            {['INCOME', 'EXPENSE'].map((t) => (
              <button type="button" key={t} onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  form.type === t ? 'bg-accent text-black' : 'bg-dark-700 text-gray-400'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <Input label="Icon (emoji)" placeholder="🍔" value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Input label="Monthly Budget (optional)" type="number" placeholder="5000" value={form.budgetLimit}
            onChange={(e) => setForm({ ...form, budgetLimit: e.target.value })} />
          <Button type="submit" loading={creating} className="w-full mt-2">Create Folder</Button>
        </form>
      </Modal>
    </div>
  );
};