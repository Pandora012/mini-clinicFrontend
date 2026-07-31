import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Form, Modal, Row, Col } from "react-bootstrap";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import { registrationService } from "../../services/registration.service";
import { patientService } from "../../services/patient.service";
import { doctorService } from "../../services/doctor.service";
import { clinicService } from "../../services/clinic.service";
import { toast } from "react-toastify";
import { PAYMENT_TYPE } from "../../constants";
import dayjs from "dayjs";

const RegistrationsPage = () => {
  console.log("RegistrationsPage Render");
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    clinic_id: "",
    visit_date: dayjs().format("YYYY-MM-DD"),
    payment_type: "",
    initial_complaint: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regsRes, patRes, docRes, cliRes] = await Promise.all([registrationService.getAll(), patientService.getAll(), doctorService.getAll(), clinicService.getAll()]);

      setRegistrations(regsRes.data.data);
      setPatients(patRes.data.data);
      setDoctors(docRes.data.data);
      setClinics(cliRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registrationService.create(formData);
      toast.success(`Pendaftaran berhasil! Nomor antrean: ${response.data.queue_number}`);
      setShowModal(false);
      setFormData({
        patient_id: "",
        doctor_id: "",
        clinic_id: "",
        visit_date: dayjs().format("YYYY-MM-DD"),
        payment_type: "",
        initial_complaint: "",
      });
      navigate("/queue");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create registration");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pendaftaran</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          Daftar Pasien
        </Button>
      </div>

      <Card>
        <Card.Body>
          {registrations.length === 0 ? (
            <EmptyState message="No registrations found" icon="bi-clipboard-plus" />
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Antrean</th>
                  <th>Pasien</th>
                  <th>Dokter</th>
                  <th>Poli</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={reg.id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{reg.queue_number}</td>
                    <td>{reg.patient?.name}</td>
                    <td>{reg.doctor?.doctor_name}</td>
                    <td>{reg.clinic?.clinic_name}</td>
                    <td>{dayjs(reg.visit_date).format("DD/MM/YYYY")}</td>
                    <td>
                      <StatusBadge status={reg.status} />
                    </td>
                    <td>
                      <Button variant="info" size="sm" onClick={() => navigate(`/examinations/${reg.id}`)} disabled={reg.status === "Menunggu"}>
                        <i className="bi bi-clipboard-pulse"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Pendaftaran Pasien Baru</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Pasien <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })} required>
                    <option value="">Pilih pasien</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.medical_record_number})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Dokter <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={formData.doctor_id} onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })} required>
                    <option value="">Pilih dokter</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.doctor_name} - {d.specialization}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Poli <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={formData.clinic_id} onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })} required>
                    <option value="">Pilih poli</option>
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clinic_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Jenis Pembayaran <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select value={formData.payment_type} onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })} required>
                    <option value="">Pilih pembayaran</option>
                    <option value={PAYMENT_TYPE.BPJS}>{PAYMENT_TYPE.BPJS}</option>
                    <option value={PAYMENT_TYPE.UMUM}>{PAYMENT_TYPE.UMUM}</option>
                    <option value={PAYMENT_TYPE.ASURANSI}>{PAYMENT_TYPE.ASURANSI}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Tanggal Kunjungan <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="date" value={formData.visit_date} onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Keluhan Awal</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.initial_complaint} onChange={(e) => setFormData({ ...formData, initial_complaint: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Daftar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationsPage;
