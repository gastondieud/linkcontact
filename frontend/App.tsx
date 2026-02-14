
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import api from './services/api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/ProductForm';
import ShopSettings from './pages/ShopSettings';
import PublicShop from './pages/PublicShop';
import Marketplace from './pages/Marketplace';

// Components
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const { setToken, setUser, setShop } = useStore();
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setToken(token);
        try {
          const userRes = await api.get('auth/me/');
          setUser(userRes.data);

          const shopRes = await api.get('shops/me/');
          setShop(shopRes.data);
        } catch (error) {
          console.error('Auth initialization failed', error);
          // Token invalid or refresh failed — clear and force login
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          setToken(null);
          setUser(null);
          setShop(null);
        }
      }
      setInitializing(false);
    };
    initApp();
  }, [setToken, setUser, setShop]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<Marketplace />} />

        {/* Public Shop Route */}
        <Route path="/shop/:slug" element={<PublicShop />} />

        {/* Dashboard Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="settings" element={<ShopSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
