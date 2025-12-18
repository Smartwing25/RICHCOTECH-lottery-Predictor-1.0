import { useState } from 'react';
import { useAuth } from '../context/AuthContextInstance';
import { useToast } from '../context/useToast';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      show('Welcome back!', 'success');
      const enabled = import.meta.env.VITE_PAYMENT_ENABLED === 'true';
      if (enabled && data.requiresPayment) {
        navigate('/payment');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to login';
      setError(msg);
      show(msg, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full card shadow-brand overflow-hidden p-8">
        <h2 className="text-3xl font-extrabold text-center text-rich-dark mb-8">Welcome Back</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full btn-primary"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-8 max-w-2xl text-center text-white/80 space-y-1">
        <p>This App Was Build By RICHOCTECH DEVELOPERS TECH COMPANY @2025.</p>
        <p>REGISTER TO LOG INTO OUR DASHBOARD</p>
        <p>Thank You For Using This App, Enjoy</p>
      </div>
    </div>
  );
};

export default Login;
