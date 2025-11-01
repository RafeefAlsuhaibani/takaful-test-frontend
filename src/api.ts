// src/api.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

// attach access token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const access = localStorage.getItem("access");
    if (access) {
      // make sure headers exists
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  }
);

// auto-refresh on 401
let isRefreshing = false;
let waiters: Array<(t: string | null) => void> = [];

const flush = (t: string | null) => {
  waiters.forEach((fn) => fn(t));
  waiters = [];
};

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: AxiosError) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };

    // if it's not 401 or we've already retried, just fail
    if (err.response?.status !== 401 || original?._retry) throw err;

    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw err;

    // if another request is already refreshing, wait for it
    if (isRefreshing) {
      const newTok = await new Promise<string | null>((resolve) =>
        waiters.push(resolve)
      );
      if (!newTok) throw err;
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newTok}`;
      original._retry = true;
      return api(original);
    }

    try {
      isRefreshing = true;
      original._retry = true;

      const { data } = await axios.post(
        `${BASE_URL}/users/auth/refresh/`,
        { refresh },
        { headers: { "Content-Type": "application/json" } }
      );

      const access = data.access as string;
      const newRefresh = (data.refresh as string) || refresh;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", newRefresh);

      // wake up waiting requests
      flush(access);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${access}`;

      return api(original);
    } catch (e) {
      // tell all waiters it failed
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
