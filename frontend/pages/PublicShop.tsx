import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Shop, Product } from '../types';
import { MessageCircle, ShoppingBag, AlertTriangle } from 'lucide-react';

const PublicShop: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopRes, prodRes] = await Promise.all([
          api.get(`shops/${slug}/`),
          api.get(`shops/${slug}/products/`)
        ]);
        setShop(shopRes.data);
        setProducts(prodRes.data);

        api.post('stats/visit/', { shop_slug: slug, action: 'visit' });
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  const sendWhatsApp = (product: Product) => {
    if (!shop?.whatsapp_number) return;

    api.post('stats/visit/', { shop_slug: slug, action: 'whatsapp_click' });

    const message = encodeURIComponent(
      `Bonjour ! Je suis intéressé par votre produit : ${product.name} (${product.price}€). Est-il disponible ?`
    );

    const cleanNumber = shop.whatsapp_number
      .replace(/\s+/g, '')
      .replace('+', '');

    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-indigo-600">
          <ShoppingBag size={48} className="animate-bounce" />
        </div>
      </div>
    );

  if (error || !shop)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={64} className="text-orange-400 mb-4" />
        <h1 className="text-2xl font-bold">Oups ! Boutique introuvable</h1>
        <p className="text-gray-500 mt-2">
          Le lien semble incorrect ou la boutique n'existe plus.
        </p>
        <a href="/" className="mt-8 text-indigo-600 font-bold underline">
          Retourner à l'accueil
        </a>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-12 px-6 text-center bg-gray-50 border-b">
        <div className="max-w-3xl mx-auto">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-md"
            />
          ) : (
            <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {shop.name.charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {shop.name}
          </h1>
          <p className="text measuring5lg mx-auto text-gray-500">
            {shop.description}
          </p>
        </div>
      </header>

      {/* Products */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <ShoppingBag size={20} className="text-indigo-600" />
          Nos Articles
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Cette boutique n'a pas encore ajouté de produits.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const imageUrl = product.image
                ? product.image.startsWith('http')
                  ? product.image
                  : `${import.meta.env.VITE_API_URL.replace(
                      /\/api\/?$/,
                      '/'
                    )}${product.image}`
                : null;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
                >
                  {/* ✅ IMAGE FIXÉE */}
                  <div className="h-64 bg-gray-100 overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">Pas d'image</div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-xl text-gray-900">
                        {product.name}
                      </h3>
                      <span className="text-indigo-600 font-bold text-xl whitespace-nowrap ml-2">
                        {product.price}CFA
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm mb-6 flex-1">
                      {product.description}
                    </p>

                    <button
                      onClick={() => sendWhatsApp(product)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-emerald-100"
                    >
                      <MessageCircle size={20} />
                      Commander sur WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-gray-50 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Propulsé par</span>
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-[10px]">
              LC
            </div>
            <span className="font-bold text-gray-600">LinkContact</span>
          </div>
          <p className="text-xs text-gray-400">
            Créez votre propre boutique en 2 minutes.
          </p>
        </div>
      </footer>

      {/* Mobile WhatsApp */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <a
          href={`https://wa.me/${shop.whatsapp_number.replace(/\s+/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse"
        >
          <MessageCircle size={28} />
        </a>
      </div>
    </div>
  );
};

export default PublicShop;
