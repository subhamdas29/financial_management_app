import { useEffect, useState } from 'react';
import { accountsApi } from '../api/accounts.api';
import { transactionsApi } from '../api/transactions.api';
import { Card } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { useAuthStore } from '../store/auth.store';
import { useSocketStore } from '../store/socket.store';
import type { Transaction } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const TxIcon = ({ type }: { type: 'CREDIT' | 'DEBIT' }) => (
  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
    type === 'CREDIT' ? 'bg-green-500/20' : 'bg-red-500/20'
  }`}>
    {type === 'CREDIT'
      ? <TrendingUp size={16} className="text-green-400" />
      : <TrendingDown size={16} className="text-red-400" />
    }
  </div>
);

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

  useEffect(() => { fetchData(); }, []);

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
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-dark-700 rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user?.name?.split(' ')[0]} 
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's your financial overview
          </p>
        </div>
      </div>


      {/* Stats */}
<div className="grid grid-cols-3 gap-4">
  <Card className="bg-[#4A4A4A] border-[#3A3A3A]">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm">Total Balance</span>
      <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
        <Wallet size={17} className="text-accent" />
      </div>
    </div>
    <p className="text-3xl font-bold tracking-tight text-accent">
      ₹{Number(summary?.totalBalance ?? 0).toLocaleString('en-IN')}
    </p>
    <p className="text-gray-500 text-xs mt-2">
      Across {summary?.totalAccounts ?? 0} accounts
    </p>
  </Card>

  <Card className="bg-[#353535] border-[#424242]">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm">This Month Income</span>
      <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
        <TrendingUp size={17} className="text-green-400" />
      </div>
    </div>
    <p className="text-3xl font-bold tracking-tight text-accent">
      ₹{Number(stats?.thisMonth?.totalCredit ?? 0).toLocaleString('en-IN')}
    </p>
    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
      <TrendingUp size={11} /> +2.5% from last month
    </p>
  </Card>

  <Card className="bg-[#2A2A2A] border-[#4A4A4A]">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm">This Month Expense</span>
      <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
        <TrendingDown size={17} className="text-red-400" />
      </div>
    </div>
    <p className="text-3xl font-bold tracking-tight text-red-400">
      ₹{Number(stats?.thisMonth?.totalDebit ?? 0).toLocaleString('en-IN')}
    </p>
    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
      <TrendingDown size={11} /> -8.2% from last month
    </p>
  </Card>
</div>

      {/* Chart */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-4">
          Income vs Expense
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5C518" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="#333"
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#333"
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#222222',
                border: '1px solid #3A3A3A',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#F5C518"
              strokeWidth={2}
              fill="url(#income)"
              dot={{ fill: '#F5C518', r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#expense)"
              dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-1">
          {recentTx.length === 0 && (
            <p className="text-gray-600 text-sm py-4 text-center">No transactions yet</p>
          )}
          {recentTx.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-dark-600 transition-colors"
            >
              <TxIcon type={tx.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.transactedAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <p className={`text-sm font-semibold flex-shrink-0 ${
                tx.type === 'CREDIT' ? 'text-accent' : 'text-red-400'
              }`}>
                {tx.type === 'CREDIT' ? '+' : ''}
                ₹{Number(tx.amount).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};