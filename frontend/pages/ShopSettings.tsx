
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { Save, Loader2, Check, Smartphone, Info, Link as LinkIcon } from 'lucide-react';

const ShopSettings: React.FC = () => {
  const { shop, setShop } = useStore();
  const [formData, setFormData] = useState({
    whatsapp_number: '',
    slug: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (shop) {
      setFormData({
        whatsapp_number: shop.whatsapp_number,
        slug: shop.slug,
        first_name: shop.first_name || '',
        last_name: shop.last_name || '',
      });
    }
  }, [shop]);

  const checkSlug = async (slug: string) => {
    if (!slug || slug === shop?.slug) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    try {
      const res = await api.get(`utils/check-slug/${slug}/`);
      setSlugStatus(res.data.available ? 'available' : 'taken');
    } catch {
      setSlugStatus('idle');
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug: val });
    checkSlug(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('shops/me/', formData);
      setShop(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres de la Boutique</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-6">
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="Jean"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="Dupont"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de la boutique</label>
            <input
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="Ma Super Boutique"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <LinkIcon size={16} className="text-gray-400" />
              Lien personnalisé (Slug)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 text-sm">linkcontact.me/shop/</span>
              <input
                required
                className="w-full pl-44 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                value={formData.slug}
                onChange={handleSlugChange}
              />
            </div>
            {slugStatus === 'available' && <p className="text-xs text-emerald-600 mt-2 font-medium">Ce lien est disponible !</p>}
            {slugStatus === 'taken' && <p className="text-xs text-red-500 mt-2 font-medium">Ce lien est déjà utilisé.</p>}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Smartphone size={16} className="text-gray-400" />
              Numéro WhatsApp (Format international)
            </label>
            <input
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="+33 6 12 34 56 78"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Info size={12} /> Utilisé pour recevoir les commandes de vos clients.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description / Slogan</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
              placeholder="Petite description de votre activité..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <button
          disabled={loading || slugStatus === 'taken'}
          type="submit"
          className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
        >
          {loading ? <Loader2 className="animate-spin" /> : saved ? <Check size={20} /> : <Save size={20} />}
          {saved ? 'Modifications enregistrées !' : 'Enregistrer les paramètres'}
        </button>
      </form>
    </div>
  );
};

export default ShopSettings;
