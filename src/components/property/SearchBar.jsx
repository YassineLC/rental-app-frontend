import { useState } from 'react';
import './SearchBar.css';

const TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LOFT', label: 'Loft' },
];

export default function SearchBar({ onSearch, initialValues = {} }) {
  const [city, setCity] = useState(initialValues.city || '');
  const [type, setType] = useState(initialValues.type || '');
  const [minPrice, setMinPrice] = useState(initialValues.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ city: city.trim(), type, minPrice, maxPrice });
  };

  const handleReset = () => {
    setCity('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-field">
        <input
          type="text"
          className="form-input"
          placeholder="Ville..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="search-field">
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="search-field">
        <input
          type="number"
          className="form-input"
          placeholder="Prix min (€)"
          value={minPrice}
          min="0"
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </div>

      <div className="search-field">
        <input
          type="number"
          className="form-input"
          placeholder="Prix max (€)"
          value={maxPrice}
          min="0"
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary">Rechercher</button>
        <button type="button" className="btn btn-ghost" onClick={handleReset}>Réinitialiser</button>
      </div>
    </form>
  );
}
