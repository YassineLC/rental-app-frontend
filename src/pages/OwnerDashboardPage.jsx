import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PropertyCard from '../components/property/PropertyCard';
import './DashboardPage.css';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente',  cls: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmée',   cls: 'badge-green'  },
  ACTIVE:    { label: 'En cours',    cls: 'badge-blue'   },
  CANCELLED: { label: 'Annulée',     cls: 'badge-red'    },
  COMPLETED: { label: 'Terminée',    cls: 'badge-gray'   },
};

export default function OwnerDashboardPage() {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('properties');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([propertyService.getMyProperties(), bookingService.getOwnerRequests()])
      .then(([props, books]) => { setProperties(props); setBookings(books); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id) => {
    setActionId(id);
    setError('');
    try {
      const updated = await bookingService.confirm(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de confirmer.');
    } finally {
      setActionId(null);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return;
    setActionId(id);
    setError('');
    try {
      const updated = await bookingService.cancel(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible d\'annuler.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!confirm('Supprimer ce logement ?')) return;
    setError('');
    try {
      await propertyService.delete(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de supprimer.');
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="dashboard-page page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="section-title">Tableau de bord propriétaire</h1>
            <p className="section-subtitle">Gérez vos logements et vos réservations</p>
          </div>
          <Link to="/dashboard/owner/add-property" className="btn btn-primary">
            + Ajouter un logement
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card card">
            <span className="stat-value">{properties.length}</span>
            <span className="stat-label">Logements</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value">{bookings.length}</span>
            <span className="stat-label">Réservations</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">En attente</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value">{properties.filter((p) => p.available).length}</span>
            <span className="stat-label">Disponibles</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${tab === 'properties' ? 'active' : ''}`}
            onClick={() => setTab('properties')}
          >
            Mes logements ({properties.length})
          </button>
          <button
            className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`}
            onClick={() => setTab('bookings')}
          >
            Réservations {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
          </button>
        </div>

        {/* Properties tab */}
        {tab === 'properties' && (
          properties.length === 0 ? (
            <div className="empty-state">
              <h3>Aucun logement</h3>
              <p>Commencez par ajouter votre premier bien.</p>
              <Link to="/dashboard/owner/add-property" className="btn btn-primary mt-16">
                Ajouter un logement
              </Link>
            </div>
          ) : (
            <div className="properties-grid">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  actions={
                    <div className="property-card-actions">
                      <Link to={`/properties/${p.id}`} className="btn btn-ghost btn-sm">Voir</Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteProperty(p.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          bookings.length === 0 ? (
            <div className="empty-state">
              <h3>Aucune réservation</h3>
              <p>Vous n'avez pas encore reçu de demandes.</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                const status = STATUS_CONFIG[booking.status] || { label: booking.status, cls: 'badge-gray' };
                return (
                  <div key={booking.id} className="booking-card card">
                    <div className="booking-card-header">
                      <div>
                        <h3 className="booking-property-title">{booking.propertyTitle}</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>{booking.propertyCity}</p>
                      </div>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>

                    <div className="booking-card-body">
                      <div className="booking-detail">
                        <span className="booking-detail-label">Arrivée</span>
                        <span>{new Date(booking.startDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="booking-detail-label">Départ</span>
                        <span>{new Date(booking.endDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="booking-detail-label">Total</span>
                        <span className="booking-price">{Number(booking.totalPrice).toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>

                    {booking.message && (
                      <p className="booking-message">"{booking.message}"</p>
                    )}

                    <div className="booking-card-footer">
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                        Demande le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleConfirm(booking.id)}
                              disabled={actionId === booking.id}
                            >
                              {actionId === booking.id ? '...' : 'Confirmer'}
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={actionId === booking.id}
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={actionId === booking.id}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
