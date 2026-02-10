
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface Shop {
  id: number;
  name: string;
  description: string;
  slug: string;
  whatsapp_number: string;
  logo?: string;
  user?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  user?: number;
}

export interface Stats {
  performance: number;
  total_visits: number;
  total_products: number;
  visits_by_day: { date: string; count: number }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
