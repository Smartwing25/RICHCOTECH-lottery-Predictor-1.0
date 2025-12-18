import { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContextInstance';
import { Loader2 } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import { useToast } from '../context/useToast';

const Prediction = () => {
  const [history, setHistory] = useState('');
  const [type, setType] = useState('5/90');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth(); // Just in case token is invalid
  const { show } = useToast();

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/api/prediction/predict', 
        { history, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      show('Prediction generated successfully', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed');
      if (err.response?.status === 401 || err.response?.status === 403) {
          // simple handling for expired session
          logout();
      }
      show('Prediction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="section-title">Lottery Prediction Tool</h1>
      
      <div className="card p-8">
        <form onSubmit={handlePredict} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lottery Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input"
            >
              <option value="5/90">5/90 (Ghana NLA, etc.)</option>
              <option value="6/49">6/49 (Lotto 6/49)</option>
              <option value="6/59">6/59 (UK Lotto)</option>
              <option value="5/39">5/39</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Draw Numbers (History)
              <span className="text-gray-500 text-xs ml-2">(Separate sets with semicolon, numbers with comma)</span>
            </label>
            <textarea
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="e.g. 1,2,3,4,5; 10,20,30,40,50"
              rows={4}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Analyze & Predict'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 rounded-xl shadow-lg text-white">
          <h3 className="text-2xl font-bold mb-4">Prediction Result</h3>
          <div className="bg-white/20 p-6 rounded-lg backdrop-blur-sm mb-4">
            <p className="text-sm uppercase tracking-wide opacity-80 mb-2">Suggested Numbers</p>
            <p className="text-4xl font-mono font-bold tracking-wider">{result.prediction}</p>
          </div>
          <div className="flex justify-between items-center text-sm opacity-90">
            <span>Confidence: {result.confidence}</span>
            <span>{result.analysis}</span>
          </div>
          <p className="mt-6 text-xs text-white/70 italic">
            Disclaimer: Predictions are for informational purposes only and do not guarantee winnings.
          </p>
        </div>
      )}
      <LoadingOverlay show={loading} text="Analyzing history and generating numbers..." />
    </div>
  );
};

export default Prediction;
