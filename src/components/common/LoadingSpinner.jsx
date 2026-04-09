export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );
}
