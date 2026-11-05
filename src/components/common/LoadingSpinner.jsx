import Spinner from 'react-bootstrap/Spinner';

const LoadingSpinner = ({ size, text = 'Memuat data…' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner animation="border" role="status" variant="primary" size={size}>
        <span className="visually-hidden">Memuat data…</span>
      </Spinner>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
