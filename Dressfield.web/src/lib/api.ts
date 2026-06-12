import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;
let pendingRefresh: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never retry the refresh endpoint itself - that would cause an infinite loop
    const isRefreshRequest = originalRequest?.url?.includes("/api/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        // Deduplicate concurrent refresh calls: all parallel 401s share one promise
        // so only one POST /api/auth/refresh fires (the token is single-use).
        if (!pendingRefresh) {
          pendingRefresh = axios
            .post(`${api.defaults.baseURL}/api/auth/refresh`, {}, { withCredentials: true })
            .then(({ data }) => {
              setAccessToken(data.accessToken);
              return data.accessToken as string;
            })
            .finally(() => {
              pendingRefresh = null;
            });
        }

        const newToken = await pendingRefresh;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
