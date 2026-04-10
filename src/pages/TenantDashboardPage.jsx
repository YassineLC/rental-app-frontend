import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './DashboardPage.css';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente',  cls: 'badge-yellow', accent: '#f59e0b' },
  CONFIRMED: { label: 'Confirmée',   cls: 'badge-green',  accent: '#22c55e' },
  ACTIVE:    { label: 'En cours',    cls: 'badge-active', accent: '#3b82f6' },
  COMPLETED: { label: 'Terminée',    cls: 'badge-gray',   accent: '#94a3b8' },
  CANCELLED: { label: 'Annulée',     cls: 'badge-red',    accent: '#ef4444' },
};

function nightCount(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000));
}

function fmtDate(str) {
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

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

  const activeCount  = bookings.filter((b) => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status)).length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => ['CONFIRMED', 'ACTIVE'].includes(b.status)).length;

  const filtered = bookings.filter((b) => {
    if (filter === 'active') return ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status);
    if (filter === 'done')   return ['COMPLETED', 'CANCELLED'].includes(b.status);
    return true;
  });

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
            <span className="stat-label">Total</span>
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

        <div className="bookings-section-header">
          <h2 className="section-title" style={{ fontSize: '1.15rem' }}>Mes réservations</h2>
          {activeCount > 0 && <span className="summary-pill">{activeCount} en cours</span>}
        </div>

        {/* Filters */}
        {bookings.length > 0 && (
          <div className="bookings-filters">
            {[['all','Toutes'], ['active','En cours'], ['done','Terminées / Annulées']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-btn ${filter === val ? 'active' : ''}`}
                onClick={() => setFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune réservation</h3>
            <p>Parcourez les logements disponibles et faites votre première demande.</p>
            <Link to="/properties" className="btn btn-primary mt-16">Voir les logements</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map((booking) => {
              const status = STATUS_CONFIG[booking.status] || { label: booking.status, cls: 'badge-gray', accent: '#94a3b8' };
              const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
              const nights = nightCount(booking.startDate, booking.endDate);
              const isActive = booking.status === 'ACTIVE';

              return (
                <div
                  key={booking.id}
                  className={`booking-card-v2 card ${isActive ? 'booking-card-v2--active' : ''}`}
                  style={{ '--accent': status.accent }}
                >
                  {/* Left accent bar */}
                  <div className="bcard-accent" />

                  <div className="bcard-body">
                    {/* Top row */}
                    <div className="bcard-top">
                      <div className="bcard-property">
                        <h3 className="bcard-title">{booking.propertyTitle}</h3>
                        <p className="bcard-city">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {booking.propertyCity}
                        </p>
                      </div>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>

                    {/* Date range + nights */}
                    <div className="bcard-dates">
                      <div className="bcard-date-block">
                        <span className="bcard-date-label">Arrivée</span>
                        <span className="bcard-date-value">{fmtDate(booking.startDate)}</span>
                      </div>
                      <div className="bcard-nights">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        <span>{nights} nuit{nights > 1 ? 's' : ''}</span>
                      </div>
                      <div className="bcard-date-block">
                        <span className="bcard-date-label">Départ</span>
                        <span className="bcard-date-value">{fmtDate(booking.endDate)}</span>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="bcard-bottom">
                      <div className="bcard-meta">
                        <span className="bcard-price">{Number(booking.totalPrice).toLocaleString('fr-FR')} €</span>
                        <span className="bcard-created">Demande le {fmtDate(booking.createdAt)}</span>
                      </div>
                      <div className="bcard-actions">
                        <Link to={`/properties/${booking.propertyId}`} className="btn btn-ghost btn-sm">
                          Voir le logement
                        </Link>
                        {canCancel && (
                          <button
                            className="btn btn-ghost btn-sm bcard-cancel"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? 'Annulation...' : 'Annuler'}
                          </button>
                        )}
                      </div>
                    </div>

                    {booking.message && (
                      <p className="bcard-message">"{booking.message}"</p>
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
