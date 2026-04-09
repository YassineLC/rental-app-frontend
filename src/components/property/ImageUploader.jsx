import { useState, useRef } from 'react';
import api from '../../api/axios';
import './ImageUploader.css';

export default function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || null);
  const inputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).');
      return;
    }

    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } catch {
      setError('Erreur lors de l\'envoi. Réessayez.');
      setPreview(value || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      handleFileChange({ target: inputRef.current });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  return (
    <div className="image-uploader">
      {preview ? (
        <div className="uploader-preview">
          <img src={preview} alt="Aperçu" className="uploader-img" />
          <div className="uploader-overlay">
            <button type="button" className="uploader-change-btn" onClick={() => inputRef.current.click()}>
              Changer la photo
            </button>
            <button type="button" className="uploader-remove-btn" onClick={handleRemove}>
              Supprimer
            </button>
          </div>
          {uploading && (
            <div className="uploader-loading">
              <div className="spinner" />
            </div>
          )}
        </div>
      ) : (
        <div
          className="uploader-zone"
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="uploader-uploading">
              <div className="spinner" />
              <span>Envoi en cours…</span>
            </div>
          ) : (
            <>
              <div className="uploader-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="uploader-text">
                <span className="uploader-link">Choisir une photo</span> ou glisser-déposer
              </p>
              <p className="uploader-hint">JPG, PNG, WEBP — max 10 Mo</p>
            </>
          )}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
