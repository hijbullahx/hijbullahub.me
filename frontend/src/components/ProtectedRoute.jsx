import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingState from "./LoadingState";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingState statusText="Redirecting" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return children;
}
