import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextInstance';
import { LayoutDashboard, Zap, History, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import LogoMark from './LogoMark';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Prediction Tool', path: '/prediction', icon: Zap },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={clsx(
        "bg-rich-dark/95 backdrop-blur text-white w-64 flex-shrink-0 transition-all duration-300 ease-in-out md:block fixed md:static h-full z-10 border-r border-white/10",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoMark size={24} />
            <h1 className="text-xl font-extrabold text-rich-gold tracking-wider">RICHCOTECH</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            X
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname === item.path ? "bg-rich-gold text-rich-dark font-semibold" : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2 text-gray-300">
            <User size={20} />
            <span className="truncate">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-400 hover:bg-white/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/95 backdrop-blur shadow-sm p-4 flex justify-between items-center">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-rich-dark">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-extrabold text-rich-dark flex items-center gap-2">
            <LogoMark size={20} />
            RICHCOTECH
          </span>
          <div className="w-6"></div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
        <footer className="px-6 pb-4 text-center">
          <p className="text-xs text-white/70">
            Lottery predictions are for informational purposes only and do not guarantee winnings.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
