import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Instance principale
export const api = axios.create({
  baseURL: API_BASE_URL
});

// =======================
// ROUTES PUBLIQUES
// =======================
const publicEndpoints = [
  '/shops/',
  '/stats/visit/',
];

// =======================
// REQUEST INTERCEPTOR
// =======================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Vérifie si endpoint public
    const isPublic = publicEndpoints.some((url) =>
      config.url?.startsWith(url)
    );

    if (!isPublic && token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// REFRESH TOKEN SYSTEM
// =======================
let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Ne refresh PAS pour endpoints publics
      const isPublic = publicEndpoints.some((url) =>
        originalRequest.url?.startsWith(url)
      );

      if (isPublic) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}auth/refresh/`, {
          refresh
        });

        const { access } = res.data;

        localStorage.setItem('token', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

        processQueue(null, access);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        localStorage.clear();
        // Force redirect to login if refresh fails
        if (window.location.hash !== '#/login') {
          window.location.hash = '/login';
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
