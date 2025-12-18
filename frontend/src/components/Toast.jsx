import { useEffect } from 'react';

const Toast = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 3500);
    return () => clearTimeout(t);
  }, [id, onClose]);

  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-amber-500';

  return (
    <div className={`text-white ${bg} rounded-lg shadow-lg px-4 py-3 flex items-center gap-2`}>
      <span className="font-semibold">{type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice'}</span>
      <span className="opacity-90">{message}</span>
    </div>
  );
};

export default Toast;

