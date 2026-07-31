const EmptyState = ({ message = 'No data found', icon = 'bi-inbox' }) => {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} display-4 text-muted`}></i>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default EmptyState;