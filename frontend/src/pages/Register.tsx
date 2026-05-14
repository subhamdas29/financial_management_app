import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import PayFlowLogo from '../assets/PayFlowLogo.png';

export const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Registration failed');
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
            Your Financial<br />
            <span className="text-accent">Journey Starts.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Join thousands managing their money smarter. Set up folders,
            track spending by category, and never miss a budget again.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-3">
          {[
            'Multiple bank accounts in one place',
            'Folder-based expense tracking',
            'Real-time transaction updates',
            'Monthly budget alerts',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-accent" />
              </div>
              <p className="text-sm text-gray-300">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <img src={PayFlowLogo} alt="PayFlow" className="h-8 w-auto object-contain" />
          </div>

          <h1 className="text-2xl font-bold mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Start managing your money</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              placeholder="Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
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
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};