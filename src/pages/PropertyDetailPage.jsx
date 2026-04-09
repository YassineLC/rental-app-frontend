import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PropertyDetailPage.css';

const TYPE_LABELS = {
  APARTMENT: 'Appartement', HOUSE: 'Maison', STUDIO: 'Studio', VILLA: 'Villa', LOFT: 'Loft',
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({ startDate: '', endDate: '', message: '' });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    propertyService.getById(id)
      .then(setProperty)
      .catch(() => navigate('/properties'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBookingChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!bookingForm.startDate || !bookingForm.endDate) {
      setBookingError('Veuillez sélectionner les dates.');
      return;
    }
    if (new Date(bookingForm.endDate) <= new Date(bookingForm.startDate)) {
      setBookingError('La date de fin doit être après la date de début.');
      return;
    }

    setBookingLoading(true);
    try {
      await bookingService.create({
        propertyId: property.id,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        message: bookingForm.message,
      });
      setBookingSuccess('Réservation envoyée ! Le propriétaire va confirmer votre demande.');
      setBookingForm({ startDate: '', endDate: '', message: '' });
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Erreur lors de la réservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  const nights = bookingForm.startDate && bookingForm.endDate
    ? Math.max(0, Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / 86400000))
    : 0;

  const estimatedPrice = nights > 0 && property
    ? ((Number(property.pricePerMonth) / 30) * nights).toFixed(2)
    : null;

  if (loading) return <LoadingSpinner fullPage />;
  if (!property) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="property-detail-page page">
      <div className="container">
        <Link to="/properties" className="back-link">← Retour aux logements</Link>

        <div className="property-detail-layout">
          {/* Main content */}
          <div className="property-detail-main">
            {/* Image */}
            <div className="property-detail-image">
              {property.imageUrl ? (
                <img src={property.imageUrl} alt={property.title} />
              ) : (
                <div className="property-detail-placeholder">&#8962;</div>
              )}
            </div>

            {/* Info */}
            <div className="property-detail-info card">
              <div className="property-detail-header">
                <div>
                  <div className="property-detail-tags">
                    {property.type && (
                      <span className="badge badge-blue">{TYPE_LABELS[property.type] || property.type}</span>
                    )}
                    <span className={`badge ${property.available ? 'badge-green' : 'badge-red'}`}>
                      {property.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                  <h1 className="property-detail-title">{property.title}</h1>
                  <p className="property-detail-location">&#9679; {property.city}{property.address ? ` — ${property.address}` : ''}</p>
                </div>
                <div className="property-detail-price">
                  <span className="price-amount">{Number(property.pricePerMonth).toLocaleString('fr-FR')} €</span>
                  <span className="price-period">/mois</span>
                </div>
              </div>

              <div className="property-detail-specs">
                {property.surface && (
                  <div className="spec-item">
                    <span className="spec-label">Surface</span>
                    <span className="spec-value">{property.surface} m²</span>
                  </div>
                )}
                {property.rooms && (
                  <div className="spec-item">
                    <span className="spec-label">Pièces</span>
                    <span className="spec-value">{property.rooms}</span>
                  </div>
                )}
              </div>

              {property.description && (
                <div className="property-detail-description">
                  <h3>Description</h3>
                  <p>{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking panel */}
          <div className="property-detail-sidebar">
            <div className="booking-panel card">
              <h3 className="booking-panel-title">Demander une réservation</h3>

              {!isAuthenticated ? (
                <div className="booking-auth-prompt">
                  <p>Connectez-vous pour réserver ce logement.</p>
                  <Link to="/login" state={{ from: `/properties/${id}` }} className="btn btn-primary btn-full mt-16">
                    Se connecter
                  </Link>
                </div>
              ) : user.role !== 'TENANT' ? (
                <p className="text-muted">Seuls les locataires peuvent effectuer des réservations.</p>
              ) : !property.available ? (
                <div className="alert alert-error">Ce logement n'est pas disponible à la réservation.</div>
              ) : (
                <form onSubmit={handleBook} className="booking-form">
                  {bookingError && <div className="alert alert-error">{bookingError}</div>}
                  {bookingSuccess && <div className="alert alert-success">{bookingSuccess}</div>}

                  <div className="form-group">
                    <label className="form-label">Date d'arrivée</label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-input"
                      value={bookingForm.startDate}
                      min={today}
                      onChange={handleBookingChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date de départ</label>
                    <input
                      type="date"
                      name="endDate"
                      className="form-input"
                      value={bookingForm.endDate}
                      min={bookingForm.startDate || today}
                      onChange={handleBookingChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message (optionnel)</label>
                    <textarea
                      name="message"
                      className="form-textarea"
                      placeholder="Présentez-vous au propriétaire..."
                      value={bookingForm.message}
                      onChange={handleBookingChange}
                      rows={3}
                    />
                  </div>

                  {estimatedPrice && (
                    <div className="booking-estimate">
                      <span>{nights} nuit{nights > 1 ? 's' : ''}</span>
                      <span className="booking-estimate-price">{Number(estimatedPrice).toLocaleString('fr-FR')} €</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-full" disabled={bookingLoading}>
                    {bookingLoading ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
