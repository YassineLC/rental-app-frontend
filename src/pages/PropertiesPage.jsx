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
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0 });

  const initialValues = {
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  };
  const currentPage = Number(searchParams.get('page') || 0);

  const fetchProperties = (params = {}, page = 0) => {
    setLoading(true);
    const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined));
    propertyService.getAll({ ...filtered, page, size: 12 })
      .then((data) => {
        setProperties(data.content || []);
        setPageInfo({
          page: data.number || 0,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        });
      })
      .catch(() => {
        setProperties([]);
        setPageInfo({ page: 0, totalPages: 0, totalElements: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties(initialValues, currentPage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (params) => {
    const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    setSearchParams({ ...filtered, page: '0' });
    fetchProperties(params, 0);
  };

  const handlePageChange = (nextPage) => {
    fetchProperties(initialValues, nextPage);
    const filtered = Object.fromEntries(Object.entries(initialValues).filter(([, v]) => v !== ''));
    setSearchParams({ ...filtered, page: String(nextPage) });
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
              {pageInfo.totalElements} logement{pageInfo.totalElements > 1 ? 's' : ''} trouvé{pageInfo.totalElements > 1 ? 's' : ''}
            </p>
            <div className="properties-grid">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
            {pageInfo.totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn btn-ghost"
                  onClick={() => handlePageChange(Math.max(0, pageInfo.page - 1))}
                  disabled={pageInfo.page <= 0}
                >
                  Précédent
                </button>
                <span className="pagination-label">
                  Page {pageInfo.page + 1} sur {pageInfo.totalPages}
                </span>
                <button
                  className="btn btn-ghost"
                  onClick={() => handlePageChange(Math.min(pageInfo.totalPages - 1, pageInfo.page + 1))}
                  disabled={pageInfo.page >= pageInfo.totalPages - 1}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
