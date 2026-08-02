import { useEffect, useState } from "react";
import { Card, Table, Button, Row, Col } from "react-bootstrap";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import { queueService } from "../../services/queue.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const QueuePage = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState({ waiting: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueues = async () => {
    try {
      const response = await queueService.getTodayQueues();
      setQueues(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch queues");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await queueService.updateStatus(id, newStatus);
      toast.success("Status updated successfully");
      fetchQueues();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleNextQueue = async () => {
    try {
      const response = await queueService.getNextQueue();

      const queue = response.data.data;

      if (queue) {
        await handleStatusUpdate(queue.id, "Check In");
        toast.success(`Calling ${queue.queue_number}`);
      } else {
        toast.info("No more queues");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get next queue");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Antrean Hari Ini</h2>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleNextQueue}>
            <i className="bi bi-bell me-2"></i>
            Panggil Berikutnya
          </Button>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-start border-4 border-secondary">
            <Card.Body>
              <h6 className="text-muted mb-2">Menunggu</h6>
              <h3 className="mb-0 fw-bold">{stats.waiting}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-start border-4 border-warning">
            <Card.Body>
              <h6 className="text-muted mb-2">Pemeriksaan</h6>
              <h3 className="mb-0 fw-bold">{stats.inProgress}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-start border-4 border-success">
            <Card.Body>
              <h6 className="text-muted mb-2">Selesai</h6>
              <h3 className="mb-0 fw-bold">{stats.completed}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {queues.length === 0 ? (
            <EmptyState message="No queues today" icon="bi-calendar-x" />
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Antrean</th>
                  <th>Pasien</th>
                  <th>Dokter</th>
                  <th>Poli</th>
                  <th>Jenis Pembayaran</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {queues.map((queue, index) => (
                  <tr key={queue.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{queue.queue_number}</td>
                    <td>{queue.patient?.name}</td>
                    <td>{queue.doctor?.doctor_name}</td>
                    <td>{queue.clinic?.clinic_name}</td>
                    <td>{queue.payment_type}</td>
                    <td>
                      <StatusBadge status={queue.status} />
                    </td>
                    <td>
                      <div className="btn-group">
                        {queue.status === "Menunggu" && (
                          <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(queue.id, "Check In")}>
                            Check In
                          </Button>
                        )}
                        {queue.status === "Check In" && (
                          <Button variant="warning" size="sm" onClick={() => handleStatusUpdate(queue.id, "Pemeriksaan")}>
                            Pemeriksaan
                          </Button>
                        )}
                        {queue.status === "Pemeriksaan" && (
                          <Button variant="success" size="sm" onClick={() => navigate(`/examinations/${queue.id}`)}>
                            SOAP
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default QueuePage;
