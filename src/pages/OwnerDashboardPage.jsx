import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PropertyCard from '../components/property/PropertyCard';
import './DashboardPage.css';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente',  cls: 'badge-yellow', accent: '#f59e0b' },
  CONFIRMED: { label: 'Confirmée',   cls: 'badge-green',  accent: '#22c55e' },
  ACTIVE:    { label: 'En cours',    cls: 'badge-active', accent: '#3b82f6' },
  CANCELLED: { label: 'Annulée',     cls: 'badge-red',    accent: '#ef4444' },
  COMPLETED: { label: 'Terminée',    cls: 'badge-gray',   accent: '#94a3b8' },
};

function fmtDate(str) {
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function nightCount(start, end) {
  return Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000));
}

export default function OwnerDashboardPage() {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('properties');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (propertyId) =>
    setCollapsedGroups((prev) => ({ ...prev, [propertyId]: !prev[propertyId] }));

  useEffect(() => {
    Promise.all([propertyService.getMyProperties(), bookingService.getOwnerRequests()])
      .then(([props, books]) => { setProperties(props); setBookings(books); })
      .catch(() => setLoadError('Impossible de charger vos logements ou vos réservations.'))
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
    if (!confirm('Annuler / refuser cette réservation ?')) return;
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
      setError(err.response?.data?.message || err.response?.data?.error || 'Impossible de supprimer.');
    }
  };

  const handleDeleteBooking = async (id) => {
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

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  const propertyGroups = Object.values(
    bookings.reduce((acc, b) => {
      if (!acc[b.propertyId]) {
        acc[b.propertyId] = { propertyId: b.propertyId, propertyTitle: b.propertyTitle, propertyCity: b.propertyCity, bookings: [] };
      }
      acc[b.propertyId].bookings.push(b);
      return acc;
    }, {})
  );

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

        {loadError && <div className="alert alert-error">{loadError}</div>}

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
                        className="btn btn-delete btn-sm"
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
            <div className="property-groups">
              {propertyGroups.map((group) => {
                const pendingInGroup = group.bookings.filter((b) => b.status === 'PENDING').length;
                const isCollapsed = !!collapsedGroups[group.propertyId];
                return (
                  <div key={group.propertyId} className="property-group">
                    <button
                      className="property-group-header"
                      onClick={() => toggleGroup(group.propertyId)}
                      aria-expanded={!isCollapsed}
                    >
                      <div className="property-group-info">
                        <svg className="property-group-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        <div>
                          <h3 className="property-group-title">{group.propertyTitle}</h3>
                          <p className="property-group-city">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {group.propertyCity}
                          </p>
                        </div>
                      </div>
                      <div className="property-group-badges">
                        <span className="property-group-count">{group.bookings.length} demande{group.bookings.length > 1 ? 's' : ''}</span>
                        {pendingInGroup > 0 && (
                          <span className="property-group-pending">{pendingInGroup} en attente</span>
                        )}
                        <svg
                          className={`property-group-chevron${isCollapsed ? ' collapsed' : ''}`}
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </button>

                    {!isCollapsed && <div className="owner-bookings-grid">
                      {group.bookings.map((booking) => {
                        const status = STATUS_CONFIG[booking.status] || { label: booking.status, cls: 'badge-gray', accent: '#94a3b8' };
                        const nights = nightCount(booking.startDate, booking.endDate);
                        return (
                          <div
                            key={booking.id}
                            className="booking-card-v2 card"
                            style={{ '--accent': status.accent }}
                          >
                            <div className="bcard-accent" />
                            <div className="bcard-body">

                              <div className="bcard-top">
                                <span className={`badge ${status.cls}`}>{status.label}</span>
                                <span className="bcard-created">Demande le {fmtDate(booking.createdAt)}</span>
                              </div>

                              <div className="bcard-dates">
                                <div className="bcard-date-block">
                                  <span className="bcard-date-label">Arrivée</span>
                                  <span className="bcard-date-value">{fmtDate(booking.startDate)}</span>
                                </div>
                                <div className="bcard-nights">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                                  <span>{nights} nuit{nights > 1 ? 's' : ''}</span>
                                </div>
                                <div className="bcard-date-block">
                                  <span className="bcard-date-label">Départ</span>
                                  <span className="bcard-date-value">{fmtDate(booking.endDate)}</span>
                                </div>
                              </div>

                              <div className="bcard-price-row">
                                <span className="bcard-price">{Number(booking.totalPrice).toLocaleString('fr-FR')} €</span>
                              </div>

                              {booking.message && (
                                <p className="bcard-message">"{booking.message}"</p>
                              )}

                              {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                <div className="bcard-owner-actions">
                                  {booking.status === 'PENDING' && (
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleConfirm(booking.id)}
                                      disabled={actionId === booking.id}
                                    >
                                      {actionId === booking.id ? '...' : 'Confirmer'}
                                    </button>
                                  )}
                                  <button
                                    className="btn btn-cancel btn-sm"
                                    onClick={() => handleCancelBooking(booking.id)}
                                    disabled={actionId === booking.id}
                                  >
                                    {booking.status === 'PENDING' ? 'Refuser' : 'Annuler'}
                                  </button>
                                </div>
                              )}
                              {booking.status === 'CANCELLED' && (
                                <div className="bcard-owner-actions">
                                  <button
                                    className="btn btn-delete btn-sm"
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    disabled={deletingId === booking.id}
                                  >
                                    {deletingId === booking.id ? '...' : 'Supprimer'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>}
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
