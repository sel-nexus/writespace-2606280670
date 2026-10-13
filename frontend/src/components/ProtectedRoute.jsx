import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { getSession, homeForSession } from '../auth/auth.js';

/** Enforce authentication and optional administrator access for a route.
 * @param {{children: import('react').ReactNode, role?: string}} props Route guard properties.
 * @returns {JSX.Element} Protected content or a role-appropriate redirect.
 */
export default function ProtectedRoute({ children, role }) {
  const session = getSession();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role === 'admin' && session.role !== 'admin') return <Navigate to="/blogs" replace />;
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string,
};
