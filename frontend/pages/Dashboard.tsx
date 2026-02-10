
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { 
  Plus, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { shop, products, setProducts, stats, setStats } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, statsRes] = await Promise.all([
          api.get('products/'),
          api.get('stats/me/')
        ]);
        setProducts(prodRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setProducts, setStats]);

  const deleteProduct = async (id: number) => {
    if (confirm("Supprimer ce produit ?")) {
      try {
        await api.delete(`products/${id}/`);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center text-gray-400">
      <div className="animate-pulse flex flex-col items-center">
        <ShoppingBag size={48} className="mb-4" />
        <p>Chargement de vos données...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {shop?.name}</h1>
          <p className="text-gray-500">Voici un aperçu de votre activité.</p>
        </div>
        <Link 
          to="/products/new" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 self-start"
        >
          <Plus size={20} />
          Nouveau produit
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium">Visites totales</p>
          <h3 className="text-2xl font-bold mt-1">{stats?.total_visits || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium">Produits actifs</p>
          <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium">Performance</p>
          <h3 className="text-2xl font-bold mt-1">{stats?.performance || 0}%</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-80">
        <h3 className="font-bold text-gray-800 mb-6">Visites des 7 derniers jours</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats?.visits_by_day || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
            <Tooltip 
              cursor={{fill: '#f9fafb'}} 
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
            />
            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Vos Produits</h3>
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Aucun produit pour le moment.</p>
            <Link to="/products/new" className="text-indigo-600 font-bold mt-2 inline-block">Ajouter votre premier article</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm group hover:shadow-md transition-all">
                <div className="relative h-48 bg-gray-100">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Pas d'image</div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Link to={`/products/edit/${product.id}`} className="p-2 bg-white/90 backdrop-blur rounded-lg text-gray-700 shadow-sm hover:bg-white">
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-500 shadow-sm hover:bg-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 truncate pr-2">{product.name}</h4>
                    <span className="text-indigo-600 font-bold text-lg">{product.price}€</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
