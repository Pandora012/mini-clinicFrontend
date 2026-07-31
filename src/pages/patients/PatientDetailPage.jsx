import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Table } from 'react-bootstrap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { patientService } from '../../services/patient.service';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await patientService.getById(id);
      setPatient(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch patient');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Detail Pasien</h2>
        <Button variant="outline-primary" onClick={() => navigate('/patients')}>
          <i className="bi bi-arrow-left me-2"></i>
          Kembali
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col md={6} xl={4}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-person-circle me-2"></i>
              Informasi Pasien
            </Card.Header>
            <Card.Body>
              <Table borderless>
                <tbody>
                  <tr>
                    <td className="fw-bold" width="40%">Nomor RM</td>
                    <td>{patient.medical_record_number}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">NIK</td>
                    <td>{patient.nik}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Nama</td>
                    <td>{patient.name}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Jenis Kelamin</td>
                    <td>{patient.gender}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Tanggal Lahir</td>
                    <td>{dayjs(patient.birth_date).format('DD MMMM YYYY')}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Telepon</td>
                    <td>{patient.phone}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={8}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <i className="bi bi-geo-alt me-2"></i>
              Alamat
            </Card.Header>
            <Card.Body>
              <p className="mb-0">{patient.address}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <i className="bi bi-clock-history me-2"></i>
          Riwayat Kunjungan
        </Card.Header>
        <Card.Body>
          <EmptyState message="No visit history found" icon="bi-calendar-x" />
        </Card.Body>
      </Card>
    </div>
  );
};

export default PatientDetailPage;