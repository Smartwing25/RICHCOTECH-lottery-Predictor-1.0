import { Link } from 'react-router-dom';
import { Zap, History } from 'lucide-react';
import LogoMark from '../components/LogoMark';
import LiveClock from '../components/LiveClock';

const Dashboard = () => {
  return (
    <div className="space-y-10">
      <section className="card p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
             style={{background: 'radial-gradient(600px circle at 10% 10%, rgba(245,158,11,0.25) 0%, transparent 60%)'}} />
        <div className="relative">
          <div className="mb-3">
            <div className="flex items-center gap-3">
              <LogoMark size={36} />
              <span className="text-2xl font-extrabold text-rich-gold">RICHCOTECH</span>
            </div>
            <div className="text-sm font-semibold text-gray-800 mt-1">Lottery Predictor</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-rich-gold">Predict smarter.</h1>
          <p className="text-gray-700 max-w-2xl">Analyze draw history and generate high-confidence number sets with a modern, fast interface built for lottery enthusiasts.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/prediction" className="btn-primary">Start Prediction</Link>
            <Link to="/history" className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors">View History</Link>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <LiveClock />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 hover:shadow-2xl transition-shadow border-l-4 border-amber-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">New Prediction</h3>
            <Zap className="text-amber-400" size={24} />
          </div>
          <p className="text-gray-600 mb-4">Analyze numbers and get your next lucky combination.</p>
          <Link to="/prediction" className="btn-primary">
            Start Prediction
          </Link>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">History</h3>
            <History className="text-blue-500" size={24} />
          </div>
          <p className="text-gray-600 mb-4">View your past predictions and analysis.</p>
          <Link to="/history" className="btn-primary">
            View History
          </Link>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
        <p className="text-gray-600">Start predicting to see your stats here!</p>
      </div>
    </div>
  );
};

export default Dashboard;
