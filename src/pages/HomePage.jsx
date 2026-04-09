import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomePage.css';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    propertyService.getAll()
      .then((data) => setFeatured(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.set('city', searchCity.trim());
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="home-page page">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            Trouvez votre <span className="hero-accent">logement idéal</span>
          </h1>
          <p className="hero-subtitle">
            Des milliers de biens disponibles partout en France. Appartements, maisons, studios et plus.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-input hero-search-input"
              placeholder="Quelle ville ?"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <button type="submit" className="btn btn-accent btn-lg">
              Rechercher
            </button>
          </form>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">1 000+</span>
              <span className="hero-stat-label">Logements</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">50+</span>
              <span className="hero-stat-label">Villes</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">500+</span>
              <span className="hero-stat-label">Propriétaires</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="featured-section">
        <div className="container">
          <div className="flex-between mb-24">
            <div>
              <h2 className="section-title">Logements récents</h2>
              <p className="section-subtitle">Découvrez les dernières annonces disponibles</p>
            </div>
            <Link to="/properties" className="btn btn-outline">
              Voir tout
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <h3>Aucun logement disponible</h3>
              <p>Revenez bientôt pour de nouvelles annonces.</p>
            </div>
          ) : (
            <div className="properties-grid">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div className="cta-text">
            <h2 className="cta-title">Vous êtes propriétaire ?</h2>
            <p className="cta-desc">Mettez votre bien en location facilement et gérez vos réservations en temps réel.</p>
          </div>
          <Link to="/register" className="btn btn-accent btn-lg">
            Proposer un logement
          </Link>
        </div>
      </section>
    </div>
  );
}
