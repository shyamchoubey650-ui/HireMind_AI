import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeRouteForRole } from '../api';

export default function ProtectedRoute({ role, children }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={homeRouteForRole(user.role)} replace />;
  }
  return children;
}
