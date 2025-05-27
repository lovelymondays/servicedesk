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

  // Clear error when needed
  clearError: () => set({ error: null }),

  // Get tasks for a specific category
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

  // Create a new task (available to all users, admin tasks auto-approved)
  createTask: async (category, taskData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        set({
          error: "Authentication required. Please log in.",
          loading: false,
        });
        return null;
      }

      const response = await axios.post(`${API_URL}/dashboard/${category}`, {
        ...taskData,
        category: category,
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

  // Update a task (admin only)
  updateTask: async (category, id, taskData) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        ...taskData,
        category: category,
        type: taskData.type || "Q&A",
      };

      const response = await axios.put(
        `${API_URL}/dashboard/${category}/${id}`,
        payload
      );

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === parseInt(id) ? response.data : task
        ),
        loading: false,
      }));

      return response.data;
    } catch (error) {
      let errorMessage = "Failed to update task";
      if (error.response?.status === 403) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      set({
        error: errorMessage,
        loading: false,
      });
      return null;
    }
  },

  // Delete a task (admin only)
  deleteTask: async (category, id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/dashboard/${category}/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== parseInt(id)),
        loading: false,
      }));
      return true;
    } catch (error) {
      let errorMessage = "Failed to delete task";
      if (error.response?.status === 403) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      set({
        error: errorMessage,
        loading: false,
      });
      return false;
    }
  },

  // Get all pending tasks (admin only)
  getPendingTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/dashboard/pending-tasks`);
      set({ tasks: response.data, loading: false });
    } catch (error) {
      let errorMessage = "Failed to fetch pending tasks";
      if (error.response?.status === 403) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  // Approve a pending task (admin only)
  approveTask: async (category, id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/dashboard/${category}/${id}/approve`
      );

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === parseInt(id) ? { ...task, status: "approved" } : task
        ),
        loading: false,
      }));

      return response.data;
    } catch (error) {
      let errorMessage = "Failed to approve task";
      if (error.response?.status === 403) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      set({
        error: errorMessage,
        loading: false,
      });
      return null;
    }
  },

  // Reject a pending task (admin only)
  rejectTask: async (category, id, reason = "") => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/dashboard/${category}/${id}/reject`,
        { reason }
      );

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === parseInt(id) ? { ...task, status: "rejected" } : task
        ),
        loading: false,
      }));

      return response.data;
    } catch (error) {
      let errorMessage = "Failed to reject task";
      if (error.response?.status === 403) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      set({
        error: errorMessage,
        loading: false,
      });
      return null;
    }
  },

  // rateTask: async (category, id, rating) => {
  //   set({ loading: true, error: null });
  //   try {
  //     const response = await axios.post(
  //       `${API_URL}/dashboard/${category}/${id}/rate`,
  //       { rating }
  //     );
  //     set((state) => ({
  //       tasks: state.tasks.map((task) =>
  //         task.id === id ? { ...task, rating: response.data.rating } : task
  //       ),
  //       loading: false,
  //     }));
  //     return response.data;
  //   } catch (error) {
  //     set({
  //       error: error.response?.data?.error || "Failed to rate task",
  //       loading: false,
  //     });
  //     return null;
  //   }
  // },
}));
