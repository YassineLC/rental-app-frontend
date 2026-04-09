import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import './AddPropertyPage.css';

const TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LOFT', label: 'Loft' },
];

export default function AddPropertyPage({ editMode = false, initialData = null, onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialData || {
    title: '',
    description: '',
    type: 'APARTMENT',
    city: '',
    address: '',
    pricePerMonth: '',
    surface: '',
    rooms: '',
    imageUrl: '',
    available: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        pricePerMonth: Number(form.pricePerMonth),
        surface: form.surface ? Number(form.surface) : undefined,
        rooms: form.rooms ? Number(form.rooms) : undefined,
      };
      if (editMode && initialData) {
        await propertyService.update(initialData.id, payload);
        onSuccess?.();
      } else {
        await propertyService.create(payload);
        navigate('/dashboard/owner');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={editMode ? '' : 'add-property-page page'}>
      <div className={editMode ? '' : 'container'}>
        {!editMode && (
          <div className="page-header">
            <h1 className="section-title">Ajouter un logement</h1>
            <p className="section-subtitle">Renseignez les informations de votre bien</p>
          </div>
        )}

        <div className="property-form-wrapper">
          <form onSubmit={handleSubmit} className="property-form card">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-section">
              <h3 className="form-section-title">Informations générales</h3>

              <div className="form-group">
                <label className="form-label">Titre de l'annonce *</label>
                <input name="title" className="form-input" value={form.title} onChange={handleChange}
                  placeholder="Ex : Bel appartement lumineux au centre-ville" required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-textarea" value={form.description}
                  onChange={handleChange} placeholder="Décrivez votre logement..." rows={4} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type de bien *</label>
                  <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Prix / mois (€) *</label>
                  <input name="pricePerMonth" type="number" className="form-input" value={form.pricePerMonth}
                    onChange={handleChange} placeholder="1200" min="0" required />
                </div>
              </div>
            </div>

            <div className="divider" />

            <div className="form-section">
              <h3 className="form-section-title">Localisation</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ville *</label>
                  <input name="city" className="form-input" value={form.city} onChange={handleChange}
                    placeholder="Paris" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input name="address" className="form-input" value={form.address} onChange={handleChange}
                    placeholder="12 rue de la Paix" />
                </div>
              </div>
            </div>

            <div className="divider" />

            <div className="form-section">
              <h3 className="form-section-title">Caractéristiques</h3>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Surface (m²)</label>
                  <input name="surface" type="number" className="form-input" value={form.surface}
                    onChange={handleChange} placeholder="65" min="0" />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de pièces</label>
                  <input name="rooms" type="number" className="form-input" value={form.rooms}
                    onChange={handleChange} placeholder="3" min="1" />
                </div>

                <div className="form-group">
                  <label className="form-label">URL image</label>
                  <input name="imageUrl" type="url" className="form-input" value={form.imageUrl}
                    onChange={handleChange} placeholder="https://..." />
                </div>
              </div>

              <label className="form-checkbox">
                <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
                <span>Logement disponible à la réservation</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sauvegarde...' : editMode ? 'Enregistrer' : 'Publier l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
