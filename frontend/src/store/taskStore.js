import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Set up axios interceptor to add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useTaskStore = create((set) => ({
  tasks: [],
  categories: [
    { id: "user-guidance", title: "User Guidance" },
    { id: "password-reset", title: "Password Reset" },
    { id: "incident-solving", title: "Incident Solving" },
    { id: "request-solving", title: "Request Solving" },
    { id: "faq", title: "FAQ" },
    { id: "sla-monitoring", title: "SLA Monitoring" },
  ],
  loading: false,
  error: null,

  getTasks: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/dashboard/${category}`);
      set({ tasks: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to fetch tasks",
        loading: false,
      });
    }
  },

  getTask: async (category, id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/${category}/${id}`
      );
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to fetch task",
        loading: false,
      });
      return null;
    }
  },

  createTask: async (category, taskData) => {
    set({ loading: true, error: null });
    try {
      // Get the token
      const token = localStorage.getItem("token");
      if (!token) {
        set({
          error: "Authentication required. Please log in.",
          loading: false,
        });
        return null;
      }

      // Ensure Authorization header is set
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.post(`${API_URL}/dashboard/${category}`, {
        ...taskData,
        status: "pending", // New tasks start as pending for admin approval
      });

      // Update the tasks list with the new task
      set((state) => ({
        tasks: [...state.tasks, response.data],
        loading: false,
        error: null,
      }));

      return response.data;
    } catch (error) {
      console.error("Create task error:", error);
      let errorMessage = "Failed to create task";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Please log in to create tasks";
          // Clear invalid token
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = "No response from server";
      }

      set({
        error: errorMessage,
        loading: false,
      });
      return null;
    }
  },

  updateTask: async (category, id, taskData) => {
    set({ loading: true, error: null });
    try {
      // Ensure all required fields are present
      const payload = {
        ...taskData,
        category: category, // Ensure category is set
        type: taskData.type || "Q&A", // Ensure type has a default
        status: taskData.status || "pending", // Ensure status has a default
      };

      const response = await axios.put(
        `${API_URL}/dashboard/${category}/${id}`,
        payload
      );
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? response.data : task
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to update task",
        loading: false,
      });
      return null;
    }
  },

  deleteTask: async (category, id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/dashboard/${category}/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to delete task",
        loading: false,
      });
      return false;
    }
  },

  addCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/categories`, categoryData);
      set((state) => ({
        categories: [...state.categories, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to add category",
        loading: false,
      });
      return null;
    }
  },

  deleteCategory: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/categories/${categoryId}`);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== categoryId),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to delete category",
        loading: false,
      });
      return false;
    }
  },

  approveTask: async (category, id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/dashboard/${category}/${id}/approve`,
        { status: "approved" }
      );
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? response.data : task
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to approve task",
        loading: false,
      });
      return null;
    }
  },

  rejectTask: async (category, id, reason) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/dashboard/${category}/${id}/reject`,
        { status: "rejected", reason }
      );
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? response.data : task
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to reject task",
        loading: false,
      });
      return null;
    }
  },

  rateTask: async (category, id, rating) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/dashboard/${category}/${id}/rate`,
        { rating }
      );
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, rating: response.data.rating } : task
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to rate task",
        loading: false,
      });
      return null;
    }
  },
}));
