import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { ShoppingBag, Search, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Marketplace: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('products/public/products/');
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

    const sendWhatsApp = (product: Product, shopNumber: string) => {
        if (!shopNumber) return;
        const message = encodeURIComponent(
            `Bonjour ! Je vous ai trouvé sur le Marketplace LinkContact. Je suis intéressé par : ${product.name} (${product.price} CFA). Est-il disponible ?`
        );
        const cleanNumber = shopNumber.replace(/\s+/g, '').replace('+', '');
        window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <ShoppingBag size={48} className="text-indigo-600 mb-4" />
                <p className="text-gray-500">Chargement du Marketplace...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">LC</div>
                        <span className="text-xl font-bold text-gray-800 hidden sm:block">Marketplace</span>
                    </Link>

                    <div className="flex-1 max-w-md mx-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link to="/login" className="px-4 py-2 rounded-xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200 transition-colors text-sm">
                            Connexion / Créer ma boutique
                        </Link>
                    </div>
                </div>
            </header>

            {/* Product Grid */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => {
                        // Fix image URL check
                        const API_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '/');
                        const imageUrl = product.image
                            ? (product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`)
                            : null;

                        // Note: PublicSerializer doesn't include shop info yet... 
                        // Wait, I need shop info to send WhatsApp!
                        // I need to update the serializer first.

                        return (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
                                <div className="h-48 bg-gray-100 relative group">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">Pas d'image</div>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                                        <span className="text-indigo-600 font-bold whitespace-nowrap">{product.price} CFA</span>
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>

                                    {/* Send to Shop's WhatsApp */}
                                    <button
                                        onClick={() => sendWhatsApp(product, product.shop_whatsapp)}
                                        className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                                    >
                                        <MessageCircle size={18} />
                                        Commander sur WhatsApp
                                    </button>

                                    <Link to={`/shop/${product.shop_slug}`} className="block text-center mt-2 text-xs text-gray-400 hover:text-indigo-600">
                                        Vendu par {product.shop_name}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Aucun produit trouvé pour "{search}"</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Marketplace;
