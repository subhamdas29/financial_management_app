import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { foldersApi } from '../api/folders.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/folders')}>
          <ArrowLeft size={16} /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {folder.icon} {folder.name}
          </h1>
          <Badge label={folder.type} variant={folder.type === 'INCOME' ? 'green' : 'red'} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-gray-400 text-sm mb-1">This Month</p>
          <p className="text-2xl font-bold">
            ₹{Number(thisMonth.totalSpent).toLocaleString('en-IN')}
          </p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm mb-1">All Time</p>
          <p className="text-2xl font-bold">
            ₹{Number(allTime.totalAmount).toLocaleString('en-IN')}
          </p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm mb-1">Transactions</p>
          <p className="text-2xl font-bold">{allTime.totalTransactions}</p>
        </Card>
      </div>

      {budgetStatus && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">Budget</p>
            {budgetStatus.isOverBudget && <Badge label="Over Budget" variant="red" />}
          </div>
          <div className="w-full bg-dark-600 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${budgetStatus.isOverBudget ? 'bg-red-500' : 'bg-accent'}`}
              style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>₹{Number(budgetStatus.spent).toLocaleString('en-IN')} spent</span>
            <span>₹{Number(budgetStatus.limit).toLocaleString('en-IN')} limit</span>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-4">This Month's Transactions</h2>
        <div className="space-y-3">
          {thisMonth.transactions.length === 0 && (
            <p className="text-gray-600 text-sm">No transactions this month</p>
          )}
          {thisMonth.transactions.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
              <div>
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-gray-500">
                  {tx.merchant} · {new Date(tx.transactedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <p className={`font-semibold text-sm ${tx.type === 'CREDIT' ? 'text-accent' : 'text-red-400'}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};