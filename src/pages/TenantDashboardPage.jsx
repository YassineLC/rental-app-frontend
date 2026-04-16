import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './DashboardPage.css';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente',  cls: 'badge-yellow', color: '#f59e0b' },
  CONFIRMED: { label: 'Confirmée',   cls: 'badge-green',  color: '#22c55e' },
  ACTIVE:    { label: 'En cours',    cls: 'badge-active', color: '#3b82f6' },
  COMPLETED: { label: 'Terminée',    cls: 'badge-gray',   color: '#94a3b8' },
  CANCELLED: { label: 'Annulée',     cls: 'badge-red',    color: '#ef4444' },
};

function fmtShort(str) {
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
function fmtFull(str) {
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function nightCount(start, end) {
  return Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000));
}

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingService.getMyBookings()
      .then(setBookings)
      .catch(() => setLoadError('Impossible de charger votre tableau de bord.'))
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

  const handleDelete = async (id) => {
    if (!confirm('Supprimer définitivement cette réservation annulée ?')) return;
    setDeletingId(id);
    setError('');
    try {
      await bookingService.delete(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de supprimer.');
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount   = bookings.filter((b) => ['PENDING','CONFIRMED','ACTIVE'].includes(b.status)).length;
  const pendingCount  = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => ['CONFIRMED','ACTIVE'].includes(b.status)).length;

  const filtered = bookings.filter((b) => {
    if (filter === 'active') return ['PENDING','CONFIRMED','ACTIVE'].includes(b.status);
    if (filter === 'done')   return ['COMPLETED','CANCELLED'].includes(b.status);
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
        {loadError && <div className="alert alert-error">{loadError}</div>}

        <div className="bookings-section-header">
          <h2 className="section-title" style={{ fontSize: '1.15rem' }}>Mes réservations</h2>
          {activeCount > 0 && <span className="summary-pill">{activeCount} en cours</span>}
        </div>

        {bookings.length > 0 && (
          <div className="bookings-filters">
            {[['all','Toutes'], ['active','En cours'], ['done','Terminées / Annulées']].map(([val, label]) => (
              <button key={val} className={`filter-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
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
          <div className="tcard-grid">
            {filtered.map((booking) => {
              const status = STATUS_CONFIG[booking.status] || { label: booking.status, cls: 'badge-gray', color: '#94a3b8' };
              const canCancel = ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(booking.status);
              const canDelete = booking.status === 'CANCELLED';
              const nights = nightCount(booking.startDate, booking.endDate);

              return (
                <div key={booking.id} className="tcard card" style={{ '--tcard-color': status.color }}>
                  {/* Colored top strip */}
                  <div className="tcard-strip" />

                  {/* Header */}
                  <div className="tcard-header">
                    <div className="tcard-header-left">
                      <h3 className="tcard-title">{booking.propertyTitle}</h3>
                      <span className="tcard-city">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {booking.propertyCity}
                      </span>
                    </div>
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                  </div>

                  {/* Date strip */}
                  <div className="tcard-dates">
                    <div className="tcard-date">
                      <span className="tcard-date-lbl">Arrivée</span>
                      <span className="tcard-date-val">{fmtShort(booking.startDate)}</span>
                    </div>
                    <div className="tcard-arrow">
                      <span className="tcard-nights">{nights}n</span>
                      <svg width="32" height="8" viewBox="0 0 32 8"><line x1="0" y1="4" x2="28" y2="4" stroke="currentColor" strokeWidth="1.5"/><polyline points="24,1 28,4 24,7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="tcard-date tcard-date--right">
                      <span className="tcard-date-lbl">Départ</span>
                      <span className="tcard-date-val">{fmtShort(booking.endDate)}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="tcard-footer">
                    <div>
                      <div className="tcard-price">{Number(booking.totalPrice).toLocaleString('fr-FR')} €</div>
                      <div className="tcard-since">Demande le {fmtShort(booking.createdAt)}</div>
                    </div>
                    <div className="tcard-actions">
                      <Link to={`/properties/${booking.propertyId}`} className="btn btn-ghost btn-sm">Voir</Link>
                      {canCancel && (
                        <button
                          className="btn btn-cancel btn-sm"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id ? '...' : 'Annuler'}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-delete btn-sm"
                          onClick={() => handleDelete(booking.id)}
                          disabled={deletingId === booking.id}
                        >
                          {deletingId === booking.id ? '...' : 'Supprimer'}
                        </button>
                      )}
                    </div>
                  </div>

                  {booking.message && (
                    <p className="tcard-message">"{booking.message}"</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
