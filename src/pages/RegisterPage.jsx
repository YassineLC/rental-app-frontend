import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'TENANT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/tenant', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card auth-card-wide card">
        <div className="auth-header">
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-subtitle">Rejoignez la plateforme de location</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-row">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="Prénom"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Nom"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Au moins 6 caractères"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Téléphone (optionnel)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-input"
              placeholder="+33 6 00 00 00 00"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Je suis</label>
            <div className="role-selector">
              <label className={`role-option ${form.role === 'TENANT' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="TENANT"
                  checked={form.role === 'TENANT'}
                  onChange={handleChange}
                />
                <span className="role-option-title">Locataire</span>
                <span className="role-option-desc">Je cherche un logement</span>
              </label>
              <label className={`role-option ${form.role === 'OWNER' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  checked={form.role === 'OWNER'}
                  onChange={handleChange}
                />
                <span className="role-option-title">Propriétaire</span>
                <span className="role-option-desc">Je propose des logements</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ?{' '}
          <Link to="/login" className="auth-link">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
