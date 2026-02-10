
import { create } from 'zustand';
import { User, Shop, Product, Stats } from '../types';

interface AppState {
  user: User | null;
  token: string | null;
  shop: Shop | null;
  products: Product[];
  stats: Stats | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setShop: (shop: Shop | null) => void;
  setProducts: (products: Product[]) => void;
  setStats: (stats: Stats | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  shop: null,
  products: [],
  stats: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  setShop: (shop) => set({ shop }),
  setProducts: (products) => set({ products }),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.clear();
    set({ user: null, token: null, shop: null, products: [], stats: null });
  },
}));
