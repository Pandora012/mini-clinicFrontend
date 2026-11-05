const ErrorState = ({ message = 'Data belum dapat dimuat.', onRetry }) => (
  <div className="error-panel" role="alert"><i className="bi bi-exclamation-circle" aria-hidden="true" /><div><strong>Gagal memuat data</strong><p>{message}</p></div>{onRetry ? <button className="btn btn-outline-primary" onClick={onRetry}>Coba lagi</button> : null}</div>
);
export default ErrorState;
