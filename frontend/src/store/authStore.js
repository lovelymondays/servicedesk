import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Add a loading lock to prevent multiple simultaneous requests
let isLoadingUser = false;
let loadingTimeout = null;

// Set up axios interceptor to add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.token) {
        throw new Error("Invalid response from server");
      }

      const { token, user } = response.data;

      // Store token and update axios default headers
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Failed to login";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = "No response from server";
      }

      set({
        user: null,
        isAuthenticated: false,
        error: errorMessage,
        loading: false,
      });

      return false;
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      let errorMessage = "Failed to register";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      set({
        error: errorMessage,
        loading: false,
      });

      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  getCurrentUser: async () => {
    // If already loading or no token, don't make another request
    if (isLoadingUser || !localStorage.getItem("token")) {
      return;
    }

    // Clear any pending timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Set loading lock
    isLoadingUser = true;
    set({ loading: true });

    try {
      const response = await axios.get(`${API_URL}/user`);

      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      set({
        user: response.data,
        isAuthenticated: true,
        error: null,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({
        user: null,
        isAuthenticated: false,
        error: "Session expired. Please login again.",
        loading: false,
      });
    } finally {
      // Release loading lock after a short delay to prevent immediate subsequent requests
      loadingTimeout = setTimeout(() => {
        isLoadingUser = false;
      }, 1000);
    }
  },

  clearError: () => set({ error: null }),

  isAdmin: () => {
    const { user } = useAuthStore.getState();
    return user?.role === "admin";
  },
}));
