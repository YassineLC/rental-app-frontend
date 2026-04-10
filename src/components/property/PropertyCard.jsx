import { Link } from 'react-router-dom';
import './PropertyCard.css';

const TYPE_LABELS = {
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  STUDIO: 'Studio',
  VILLA: 'Villa',
  LOFT: 'Loft',
};

const API_BASE = 'http://localhost:8080';

export default function PropertyCard({ property, actions }) {
  const { id, title, city, pricePerMonth, type, surface, rooms, available, imageUrl } = property;
  const resolvedImage = imageUrl?.startsWith('/api/') ? API_BASE + imageUrl : imageUrl;

  return (
    <div className="property-card card">
      <div className="property-card-image">
        {resolvedImage ? (
          <img src={resolvedImage} alt={title} />
        ) : (
          <div className="property-card-placeholder">
            <span>&#8962;</span>
          </div>
        )}
        <span className={`property-status-badge ${available ? 'badge-green' : 'badge-red'} badge`}>
          {available ? 'Disponible' : 'Indisponible'}
        </span>
        {type && (
          <span className="property-type-badge badge badge-blue">
            {TYPE_LABELS[type] || type}
          </span>
        )}
      </div>

      <div className="property-card-body">
        <h3 className="property-card-title">{title}</h3>
        <p className="property-card-city">
          <span className="location-icon">&#9679;</span> {city}
        </p>

        <div className="property-card-meta">
          {surface && <span>{surface} m²</span>}
          {rooms && <span>{rooms} pièce{rooms > 1 ? 's' : ''}</span>}
        </div>

        <div className="property-card-footer">
          <div className="property-price">
            <span className="price-amount">{Number(pricePerMonth).toLocaleString('fr-FR')} €</span>
            <span className="price-period">/mois</span>
          </div>

          <div className="property-card-actions">
            {actions || (
              <Link to={`/properties/${id}`} className="btn btn-primary btn-sm">
                Voir
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
