import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import PayFlowLogo from '../assets/PayFlowLogo.png';

export const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-800">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-dark-700 flex-col justify-between p-12">
        <div>
          <img src={PayFlowLogo} alt="PayFlow" className="h-10 w-auto object-contain" />
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage Your<br />
            <span className="text-accent">Money Smarter.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Track your expenses, manage multiple accounts, set budgets
            and get real-time insights into your financial health.
          </p>
        </div>

        {/* Fake stat cards */}
        <div className="space-y-3">
          <div className="bg-dark-600 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Balance</p>
              <p className="text-xl font-bold text-accent">₹1,43,980</p>
            </div>
            <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              +12.5%
            </div>
          </div>
          <div className="bg-dark-600 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">This Month Savings</p>
              <p className="text-xl font-bold">₹43,980</p>
            </div>
            <div className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
              On track
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <img src={PayFlowLogo} alt="PayFlow" className="h-8 w-auto object-contain" />
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};