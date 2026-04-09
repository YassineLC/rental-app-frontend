import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './DashboardPage.css';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente',  cls: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmée',   cls: 'badge-green'  },
  CANCELLED: { label: 'Annulée',     cls: 'badge-red'    },
  COMPLETED: { label: 'Terminée',    cls: 'badge-gray'   },
};

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    bookingService.getMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return;
    setCancellingId(id);
    setError('');
    try {
      const updated = await bookingService.cancel(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible d\'annuler.');
    } finally {
      setCancellingId(null);
    }
  };

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="dashboard-page page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="section-title">Bonjour, {user?.firstName} !</h1>
            <p className="section-subtitle">Suivez vos demandes de location</p>
          </div>
          <Link to="/properties" className="btn btn-primary">Chercher un logement</Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card card">
            <span className="stat-value">{bookings.length}</span>
            <span className="stat-label">Total réservations</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">En attente</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value">{confirmedCount}</span>
            <span className="stat-label">Confirmées</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <h2 className="section-title" style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Mes réservations</h2>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune réservation</h3>
            <p>Parcourez les logements disponibles et faites votre première demande.</p>
            <Link to="/properties" className="btn btn-primary mt-16">Voir les logements</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const status = STATUS_CONFIG[booking.status] || { label: booking.status, cls: 'badge-gray' };
              const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
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
                    {canCancel && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
