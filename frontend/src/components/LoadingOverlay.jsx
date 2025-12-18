import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ show, text = 'Processing...' }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white/95 rounded-xl shadow-xl px-6 py-5 flex items-center gap-3">
        <Loader2 className="animate-spin text-amber-500" size={24} />
        <span className="font-semibold text-gray-800">{text}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;

