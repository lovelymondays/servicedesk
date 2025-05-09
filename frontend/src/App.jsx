// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/Layout";
import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CategoryContent from "./components/CategoryContent";

function App() {
  const { getCurrentUser, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser();
    }
  }, [getCurrentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/:categoryId" element={<CategoryContent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
