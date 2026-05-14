import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#0a0b0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingScreen message="AUTHENTICATING..." />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
