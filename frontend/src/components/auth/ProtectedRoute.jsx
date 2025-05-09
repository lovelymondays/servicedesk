import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useCallback } from "react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, getCurrentUser } = useAuthStore();

  // Wrap getCurrentUser in useCallback to prevent unnecessary re-renders
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated && !loading) {
      getCurrentUser();
    }
  }, [getCurrentUser, isAuthenticated, loading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
