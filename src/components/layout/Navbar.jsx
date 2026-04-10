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
          <svg className="brand-logo" width="30" height="28" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2L2 12.5V27h9v-8h8v8h9V12.5L15 2Z" fill="#e55c2f"/>
            <path d="M15 2L2 12.5" stroke="#0f2b46" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M15 2L28 12.5" stroke="#0f2b46" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="12" y="19" width="6" height="8" rx="1" fill="#0f2b46" opacity="0.3"/>
          </svg>
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
                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                  {user.role === 'TENANT' ? 'Locataire' : user.role === 'OWNER' ? 'Propriétaire' : 'Admin'}
                </span>
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
