import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { foldersApi } from '../api/folders.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { ArrowLeft, TrendingUp, TrendingDown, Receipt, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const TxIcon = ({ type }: { type: 'CREDIT' | 'DEBIT' }) => (
  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
    type === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'
  }`}>
    {type === 'CREDIT'
      ? <TrendingUp size={15} className="text-green-400" />
      : <TrendingDown size={15} className="text-red-400" />
    }
  </div>
);

export const FolderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    foldersApi.getFolderSummary(id)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load folder'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!data) return null;

  const { folder, allTime, thisMonth, budgetStatus } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/folders')}
          className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-500 flex items-center justify-center text-gray-400 hover:text-white hover:border-accent/50 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">
            {folder.icon || '📁'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{folder.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              folder.type === 'INCOME'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {folder.type}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">This Month</p>
            <CalendarDays size={15} className="text-accent" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            ₹{Number(thisMonth.totalSpent).toLocaleString('en-IN')}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">All Time</p>
            <TrendingUp size={15} className="text-accent" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            ₹{Number(allTime.totalAmount).toLocaleString('en-IN')}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Transactions</p>
            <Receipt size={15} className="text-accent" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {allTime.totalTransactions}
          </p>
        </Card>
      </div>

      {/* Budget bar */}
      {budgetStatus && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Monthly Budget</p>
            {budgetStatus.isOverBudget && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400">
                Over Budget
              </span>
            )}
          </div>
          <div className="w-full bg-dark-500 rounded-full h-2.5 mb-3">
            <div
              className={`h-2.5 rounded-full transition-all ${
                budgetStatus.isOverBudget ? 'bg-red-500' : 'bg-accent'
              }`}
              style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">
              <span className="text-white font-semibold">
                ₹{Number(budgetStatus.spent).toLocaleString('en-IN')}
              </span>{' '}
              spent
            </span>
            <span className="text-gray-500">
              {budgetStatus.percentageUsed}% of ₹{Number(budgetStatus.limit).toLocaleString('en-IN')}
            </span>
            <span className={budgetStatus.isOverBudget ? 'text-red-400' : 'text-green-400'}>
              {budgetStatus.isOverBudget ? '-' : ''}₹{Math.abs(Number(budgetStatus.remaining)).toLocaleString('en-IN')}{' '}
              {budgetStatus.isOverBudget ? 'over' : 'remaining'}
            </span>
          </div>
        </Card>
      )}

      {/* Transactions list */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-500">
          <h2 className="text-sm font-semibold text-gray-400">This Month's Transactions</h2>
        </div>
        {thisMonth.transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <Receipt size={36} className="mb-3 opacity-30" />
            <p className="text-sm">No transactions this month</p>
          </div>
        )}
        {thisMonth.transactions.map((tx: any, i: number) => (
          <div
            key={tx.id}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-dark-600 transition-colors ${
              i !== thisMonth.transactions.length - 1 ? 'border-b border-dark-500' : ''
            }`}
          >
            <TxIcon type={tx.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {tx.merchant && `${tx.merchant} · `}
                {new Date(tx.transactedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short',
                })}
              </p>
            </div>
            <p className={`text-sm font-bold flex-shrink-0 ${
              tx.type === 'CREDIT' ? 'text-accent' : 'text-red-400'
            }`}>
              {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
};