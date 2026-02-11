import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, Upload, Loader2, Save } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string | null;
}

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // --- nouvelle variable pour gérer l'édition d'un produit depuis la liste ---
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`products/${id}/`)
        .then(res => {
          setFormData({
            name: res.data.name,
            price: res.data.price.toString(),
            description: res.data.description,
          });
          if (res.data.image) {
            const API_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '/');
            setPreview(`${API_URL}${res.data.image}`);
          }
          setEditId(res.data.id);
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    if (imageFile) data.append('image', imageFile);

    try {
      if (editId) {
        await api.put(`products/${editId}/`, data);
      } else if (isEdit) {
        await api.put(`products/${id}/`, data);
      } else {
        await api.post('products/', data);
      }

      // réinitialiser le formulaire après soumission
      setFormData({ name: '', price: '', description: '' });
      setPreview(null);
      setImageFile(null);
      setEditId(null);

      // recharger la liste
      fetchProducts();
    } catch (err) {
      alert("Une erreur est survenue lors de l'enregistrement.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Liste des produits intégrée ---
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get('products/');
      setProducts(res.data);
    } catch (err) {
      console.error('Erreur récupération produits:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (fetching) return <div className="p-20 text-center">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Retour
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {editId || isEdit ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* Image Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">Image du produit</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all group relative overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-bold">Changer l'image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 font-medium">Cliquez pour télécharger</p>
                  <p className="text-xs text-gray-400">PNG, JPG ou WEBP (Max. 5MB)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Nom, Prix, Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit</label>
            <input
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="Ex: T-shirt en coton bio"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Prix en CFA</label>
            <input
              required
              type="number"
              step="100"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="Ex: 5000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
              placeholder="Décrivez votre produit pour donner envie à vos clients..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {editId || isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
        </button>
      </form>

      {/* --- Affichage des produits en dessous avec click pour édition --- */}
      <div className="mt-12">
        {productsLoading ? (
          <div className="text-center py-10">Chargement des produits...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">Aucun produit disponible.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
              const API_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '/');
              const imageUrl = product.image ? `${API_URL}${product.image}` : null;

              return (
                <div
                  key={product.id}
                  className="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => {
                    setFormData({
                      name: product.name,
                      price: product.price.toString(),
                      description: product.description,
                    });
                    setPreview(imageUrl);
                    setEditId(product.id);
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                      <span className="text-gray-400">Pas d'image</span>
                    </div>
                  )}
                  <h2 className="font-bold text-lg">{product.name}</h2>
                  <p className="text-gray-500 mb-2">{product.description}</p>
                  <p className="text-indigo-600 font-semibold">{product.price.toLocaleString()} CFA</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
