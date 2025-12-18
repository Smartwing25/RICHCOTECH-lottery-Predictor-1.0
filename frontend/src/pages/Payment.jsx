import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextInstance';
import { useToast } from '../context/useToast';

const Payment = () => {
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('vodafone');
  const [status, setStatus] = useState('none');
  const [transId, setTransId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show } = useToast();

  useEffect(() => {
    const enabled = import.meta.env.VITE_PAYMENT_ENABLED === 'true';
    if (!enabled) {
      navigate('/');
      return;
    }
    if (user?.role === 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const initiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/api/payment/initiate', { phone, channel }, { headers: { Authorization: `Bearer ${token}` } });
      setTransId(res.data.transactionId || null);
      setStatus(res.data.status || 'initiated');
      show('Payment initiated. Approve on your phone.', 'info');
    } catch {
      show('Failed to initiate payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const enabled = import.meta.env.VITE_PAYMENT_ENABLED === 'true';
    if (!enabled) return;
    const token = localStorage.getItem('token');
    let interval = setInterval(async () => {
      try {
        const res = await api.get('/api/payment/status', { headers: { Authorization: `Bearer ${token}` } });
        const st = res.data.status;
        setStatus(st);
        if (st === 'success') {
          show('Payment successful. Redirecting...', 'success');
          clearInterval(interval);
          setTimeout(() => navigate('/'), 1200);
        }
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [navigate, show]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card overflow-hidden p-8">
        <h2 className="text-2xl font-extrabold text-center text-rich-dark mb-6">GH¢5 Access Payment</h2>
        <form onSubmit={initiate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="e.g., 0201234567"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Network</label>
            <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="vodafone">Vodafone Cash</option>
              <option value="mtn-gh">MTN Mobile Money</option>
              <option value="airteltigo-gh">AirtelTigo Money</option>
            </select>
          </div>
          <button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Pay GH¢5'}
          </button>
        </form>
        <div className="mt-6">
          <p className="text-sm text-gray-600">Status: <span className="font-semibold">{status}</span></p>
          {transId && <p className="text-xs text-gray-500">Transaction ID: {transId}</p>}
        </div>
        <div className="mt-6 text-xs text-gray-600">
          Lottery predictions are for informational purposes only and do not guarantee winnings.
        </div>
      </div>
    </div>
  );
};

export default Payment;
