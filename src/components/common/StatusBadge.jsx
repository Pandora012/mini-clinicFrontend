import Badge from 'react-bootstrap/Badge';

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Menunggu':
        return 'secondary';
      case 'Check In':
        return 'primary';
      case 'Pemeriksaan':
        return 'warning';
      case 'Selesai':
        return 'success';
      default:
        return 'light';
    }
  };

  return (
    <Badge bg={getStatusColor(status)}>{status}</Badge>
  );
};

export default StatusBadge;