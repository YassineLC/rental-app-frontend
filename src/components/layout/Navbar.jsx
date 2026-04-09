import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'OWNER') return '/dashboard/owner';
    if (user.role === 'ADMIN') return '/dashboard/owner';
    return '/dashboard/tenant';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">&#8962;</span>
          <span>RentalApp</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/properties" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Logements
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to={getDashboardPath()} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Tableau de bord
              </NavLink>
              <div className="navbar-user">
                <span className="user-name">{user.firstName}</span>
                <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Inscription</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
