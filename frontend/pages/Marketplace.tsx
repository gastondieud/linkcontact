```
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { ShoppingBag, Search, MessageCircle, Star, Sparkles, TrendingUp } from 'lucide-react'; // Added icons
import { Link } from 'react-router-dom';

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fix: Correct API URL
        const res = await api.get('public/products/');
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Error fetching marketplace products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  const sendWhatsApp = (product: Product, shopNumber?: string) => {
    if (!shopNumber) return;
    const message = encodeURIComponent(
      `Bonjour! Je vous ai trouvé sur le Marketplace LinkContact.Je suis intéressé par: ${ product.name } (${ product.price } CFA).Est - il disponible ? `
    );
    const cleanNumber = shopNumber.replace(/\s+/g, '').replace('+', '');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-medium animate-pulse">Chargement du Showroom...</p>
        </div>
    </div>
);

return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {/* Navbar with Glass effect */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold transform group-hover:scale-110 transition-transform duration-200 shadow-indigo-200 shadow-lg">LC</div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">Marketplace</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Vendre mes produits</Link>
                    <Link to="/login" className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5">
                        Connexion
                    </Link>
                </div>
            </div>
        </header>

        {/* Hero Section */}
        <div className="bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50 opacity-70"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-600 text-sm font-semibold mb-6 animate-fade-in-up">
                    <Sparkles size={16} />
                    <span>Découvrez les meilleures offres</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                    Le Showroom <span className="text-indigo-600">Premium</span>
                </h1>
                <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Explorez une sélection unique de produits vendus par des créateurs passionnés. Trouvez votre bonheur dès aujourd'hui.
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-pink-200 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-gray-100">
                        <Search className="text-gray-400 ml-4" size={24} />
                        <input
                            type="text"
                            placeholder="Rechercher une montre, un vêtement, un service..."
                            className="w-full px-4 py-4 text-gray-700 bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors">
                            <Search size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" />
                    Produits Tendance
                </h2>
                <span className="text-sm text-gray-500">{filteredProducts.length} résultats</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map(product => {
                    const API_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '/');
                    const imageUrl = product.image
                        ? (product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`)
                        : null;

                    return (
                        <div key={product.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1">
                            <div className="h-64 bg-gray-100 relative overflow-hidden">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                                        <ShoppingBag size={48} className="mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Image non disponible</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-900 z-10">
                                    {product.shop_name || 'Boutique'}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 h-10 leading-relaxed">{product.description}</p>
                                </div>

                                <div className="flex items-end justify-between mt-6">
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Prix</p>
                                        <span className="text-2xl font-extrabold text-gray-900">{product.price.toLocaleString()} <span className="text-sm font-medium text-gray-500">CFA</span></span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => sendWhatsApp(product, product.shop_whatsapp)}
                                        disabled={!product.shop_whatsapp}
                                        className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group-hover:shadow-indigo-200 active:scale-95"
                                    >
                                        <MessageCircle size={20} />
                                        {product.shop_whatsapp ? 'Commander' : 'Indisponible'}
                                    </button>
                                    {product.shop_slug && (
                                        <Link to={`/shop/${product.shop_slug}`} className="block text-center mt-3 text-xs font-medium text-gray-400 hover:text-indigo-500 transition-colors">
                                            Visiter la boutique
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-32">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Nous n'avons trouvé aucun résultat pour "{search}". Essayez avec d'autres mots-clés.
                    </p>
                </div>
            )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-12 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">LC</div>
                    <span className="font-bold text-gray-700">LinkContact Marketplace</span>
                </div>
                <p className="text-gray-400 text-sm">© 2026 Tous droits réservés.</p>
            </div>
        </footer>
    </div>
);
};

export default Marketplace;
```
