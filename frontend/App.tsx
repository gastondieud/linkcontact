
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

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // keep token in store so ProtectedRoute works
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
          window.location.href = '#/login';
        }
      }
    };
    initApp();
  }, [setToken, setUser, setShop]);

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
