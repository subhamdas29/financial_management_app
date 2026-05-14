import { useEffect, useState } from 'react';
import { accountsApi } from '../api/accounts.api';
import { transactionsApi } from '../api/transactions.api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { useAuthStore } from '../store/auth.store';
import { useSocketStore } from '../store/socket.store';
import type { Transaction } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [summaryRes, statsRes, txRes] = await Promise.all([
        accountsApi.getSummary(),
        transactionsApi.getStats(),
        transactionsApi.getAll({ limit: 5 }),
      ]);
      setSummary(summaryRes.data.data);
      setStats(statsRes.data.data);
      setRecentTx(txRes.data.data.transactions);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    socket.on('transaction:new', (data: any) => {
      toast.success(`New transaction: ₹${data.transaction.amount}`);
      fetchData();
    });
    return () => { socket.off('transaction:new'); };
  }, [socket]);

  if (loading) return <Loader />;

  const chartData = [
    { month: 'Jan', income: 50000, expense: 32000 },
    { month: 'Feb', income: 50000, expense: 28000 },
    { month: 'Mar', income: 50000, expense: 35000 },
    { month: 'Apr', income: 50000, expense: 29000 },
    { month: 'May', income: 50000, expense: 31000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's your financial overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Total Balance</span>
            <Wallet size={18} className="text-accent" />
          </div>
          <p className="text-3xl font-bold">
            ₹{Number(summary?.totalBalance ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Across {summary?.totalAccounts ?? 0} accounts
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">This Month Income</span>
            <TrendingUp size={18} className="text-accent" />
          </div>
          <p className="text-3xl font-bold text-accent">
            ₹{Number(stats?.thisMonth?.totalCredit ?? 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">This Month Expense</span>
            <TrendingDown size={18} className="text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400">
            ₹{Number(stats?.thisMonth?.totalDebit ?? 0).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-4">
          Income vs Expense
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#444" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12 }}
            />
            <Area type="monotone" dataKey="income" stroke="#CCFF00" fill="url(#income)" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expense)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-3">
          {recentTx.length === 0 && (
            <p className="text-gray-600 text-sm">No transactions yet</p>
          )}
          {recentTx.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
              <div>
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-gray-500">
                  {tx.merchant ?? tx.account?.name} ·{' '}
                  {new Date(tx.transactedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-accent' : 'text-red-400'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                </p>
                {tx.folder && (
                  <Badge label={tx.folder.name} variant="gray" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};