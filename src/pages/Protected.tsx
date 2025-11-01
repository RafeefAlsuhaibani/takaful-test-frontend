import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}
