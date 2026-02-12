
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { shop, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Mes Produits', icon: <Package size={20} />, path: '/products/new' },
    { label: 'Marketplace', icon: <ShoppingBag size={20} />, path: '/marketplace' },
    { label: 'Paramètres', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen">
        <div className="mb-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">LC</div>
          <span className="text-xl font-bold text-gray-800">LinkContact</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-6 border-t border-gray-100">
          {shop && (
            <a
              href={`#/shop/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-xl"
            >
              <ExternalLink size={18} />
              Voir ma boutique
            </a>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">LC</div>
          <span className="font-bold">LinkContact</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 py-4 border-b border-gray-100 text-lg font-medium"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-4 py-4 text-red-500 font-medium">
            <LogOut size={20} /> Déconnexion
          </button>
          {shop && (
            <a
              href={`#/shop/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 py-4 border-t border-gray-100 text-emerald-600 font-medium"
            >
              <ExternalLink size={20} />
              Voir ma boutique
            </a>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
