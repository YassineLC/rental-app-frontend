import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import SearchBar from '../components/property/SearchBar';
import PropertyCard from '../components/property/PropertyCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PropertiesPage.css';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialValues = {
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  };

  const fetchProperties = (params = {}) => {
    setLoading(true);
    const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
    propertyService.getAll(filtered)
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties(initialValues);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (params) => {
    const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    setSearchParams(filtered);
    fetchProperties(params);
  };

  return (
    <div className="properties-page page">
      <div className="container">
        <div className="properties-header">
          <h1 className="section-title">Logements disponibles</h1>
          <p className="section-subtitle">Filtrez et trouvez le bien qui vous correspond</p>
        </div>

        <div className="mb-24">
          <SearchBar onSearch={handleSearch} initialValues={initialValues} />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun logement trouvé</h3>
            <p>Essayez d'autres critères de recherche.</p>
          </div>
        ) : (
          <>
            <p className="results-count text-muted mb-16">
              {properties.length} logement{properties.length > 1 ? 's' : ''} trouvé{properties.length > 1 ? 's' : ''}
            </p>
            <div className="properties-grid">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
