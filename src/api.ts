// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // or VITE_API_BASE_URL if you chose that name
});

// attach access token if present
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// auto-refresh on 401
let isRefreshing = false;
let waiters: Array<(t: string | null) => void> = [];
const flush = (t: string | null) => { waiters.forEach(fn => fn(t)); waiters = []; };

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) throw err;

    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw err;

    if (isRefreshing) {
      const newTok = await new Promise<string | null>(r => waiters.push(r));
      if (!newTok) throw err;
      original.headers.Authorization = `Bearer ${newTok}`;
      original._retry = true;
      return api(original);
    }

    try {
      isRefreshing = true;
      original._retry = true;
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/auth/refresh/`,
        { refresh },
        { headers: { "Content-Type": "application/json" } }
      );
      const access = data.access as string;
      const newRefresh = (data.refresh as string) || refresh;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", newRefresh);
      flush(access);
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch (e) {
      flush(null);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
