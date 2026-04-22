import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, requireProfile = false }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Preparing MatchMitra..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const profileIsComplete =
    profile?.isProfileComplete ||
    (typeof profile?.profileComplete === 'number' && profile.profileComplete >= 20);

  if (requireProfile && !profileIsComplete) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
