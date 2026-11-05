import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card className="stat-card h-100">
      <Card.Body>
        <Row className="align-items-center">
          <Col>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0 fw-bold">{value}</h3>
          </Col>
          <Col xs="auto">
            <div className={`icon-box bg-${color} bg-opacity-10 text-${color} rounded-3 p-3`}>
              <i className={`bi ${icon} fs-4`}></i>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
