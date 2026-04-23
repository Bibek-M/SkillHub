import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "skillhub_token";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Request failed';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject(new Error('No response from server. Please check if the server is running.'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toLowerCase();
  const useAuth = options.auth !== false;

  let config: any = {
    method,
    url: path,
  };

  if (!useAuth) {
    // Temporarily remove auth header for this request
    config.headers = { ...apiClient.defaults?.headers };
    delete config.headers.Authorization;
  }

  if (['post', 'put', 'patch'].includes(method) && options.body) {
    config.data = options.body;
  }

  const response = await apiClient(config);

  if (response.status === 204) return undefined as T;
  return response.data as Promise<T>;
}

export const api = {
  signup: (payload: { username: string; email: string; password: string; role?: string }) =>
    request<{ token: string; user: any }>("/auth/signup", { method: "POST", body: payload, auth: false }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request<{ user: any }>("/auth/me"),
  listUsers: () => request<{ users: any[] }>("/users"),
  deleteUser: (id: string) => request<void>(`/users/${id}`, { method: "DELETE" }),
  listSkills: () => request<{ skills: any[] }>("/skills"),
  createSkill: (payload: { title: string; description: string; category: string }) =>
    request<{ skill: any }>("/skills", { method: "POST", body: payload }),
  deleteSkill: (id: string) => request<void>(`/skills/${id}`, { method: "DELETE" }),
  listMessages: (otherUserId: string) => request<{ messages: any[] }>(`/messages/${otherUserId}`),
  sendMessage: (payload: { receiver_id: string; message: string }) =>
    request<{ message: any }>("/messages", { method: "POST", body: payload }),
  listNotifications: () => request<{ notifications: any[] }>("/notifications"),
  createNotification: (payload: { message: string }) =>
    request<{ notification: any }>("/notifications", { method: "POST", body: payload }),
};