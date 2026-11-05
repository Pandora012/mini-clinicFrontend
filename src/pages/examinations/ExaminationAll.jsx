import { useEffect, useState } from "react";
import { Card, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import { queueService } from "../../services/queue.service";

const ExaminationAll = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await queueService.getTodayQueues();

      setError("");
      // Hanya tampilkan pasien yang sedang pemeriksaan
      const data = response.data.data.filter((item) => ["Check In", "Pemeriksaan"].includes(item.status));

      setQueues(data);
    } catch (error) {
      setError(error.response?.data?.message || "Gagal mengambil data pemeriksaan.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="mb-4">Daftar Pemeriksaan</h2>

      <Card>
        <Card.Body>
          {error ? <ErrorState message={error} onRetry={fetchData} /> : queues.length === 0 ? (
            <EmptyState message="Belum ada pasien yang sedang diperiksa" icon="bi-clipboard-pulse" />
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Antrean</th>
                  <th>Pasien</th>
                  <th>Dokter</th>
                  <th>Poli</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {queues.map((queue, index) => (
                  <tr key={queue.id}>
                    <td>{index + 1}</td>
                    <td>{queue.queue_number}</td>
                    <td>{queue.patient?.name}</td>
                    <td>{queue.doctor?.doctor_name}</td>
                    <td>{queue.clinic?.clinic_name}</td>
                    <td>
                      <StatusBadge status={queue.status} />
                    </td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/examinations/${queue.id}`)}>
                        SOAP
                      </Button>
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

export default ExaminationAll;
