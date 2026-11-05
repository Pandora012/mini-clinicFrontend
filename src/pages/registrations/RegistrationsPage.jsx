import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Form, Modal, Row, Col } from "react-bootstrap";
import ErrorState from "../../components/common/ErrorState";
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

  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(false);
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
    if (!showModal) return;
    const controller = new AbortController();
    setPatientsLoading(true);
    const timeout = setTimeout(() => {
      patientService.getAll({ search: patientSearch, limit: 50 }, controller.signal)
        .then(response => { if (!controller.signal.aborted) setPatients(response.data.data); })
        .catch(error => { if (!controller.signal.aborted) toast.error(error.response?.data?.message || 'Pencarian pasien gagal.'); })
        .finally(() => { if (!controller.signal.aborted) setPatientsLoading(false); });
    }, 300);
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [patientSearch, showModal]);

  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    try {
      const [regsRes, patRes, docRes, cliRes] = await Promise.all([registrationService.getAll({ page, limit: 10 }, signal), patientService.getAll({ limit: 50 }, signal), doctorService.getAll({ limit: 100 }, signal), clinicService.getAll({ limit: 100 }, signal)]);

      if (signal?.aborted) return;
      setError("");
      setTotalPages(Math.max(1, regsRes.data.pagination.totalPages));
      setRegistrations(regsRes.data.data);
      setPatients(patRes.data.data);
      setDoctors(docRes.data.data);
      setClinics(cliRes.data.data);
    } catch (error) {
      if (!signal?.aborted) setError(error.response?.data?.message || "Data pendaftaran belum dapat dimuat.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page]);
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const response = await registrationService.create(formData);
      toast.success(`Pendaftaran berhasil! Nomor antrean: ${response.data.data.queue_number}`);
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
      toast.error(error.response?.data?.message || "Pendaftaran gagal disimpan.");
    } finally { setSaving(false); }
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
          {error ? <ErrorState message={error} onRetry={() => fetchData()} /> : registrations.length === 0 ? (
            <EmptyState message="Belum ada pendaftaran pasien." icon="bi-clipboard-plus" />
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
                      <Button variant="info" size="sm" onClick={() => navigate(`/patients/detail/${reg.patient_id}`)} aria-label="Lihat detail pasien">
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

      {totalPages > 1 ? <div className="table-pagination"><span>Halaman {page} dari {totalPages}</span><div className="d-flex gap-2"><Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Sebelumnya</Button><Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>Berikutnya</Button></div></div> : null}
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
                  <Form.Control className="mb-2" aria-label="Cari pasien untuk pendaftaran" placeholder="Cari nama, NIK, atau nomor RM…" value={patientSearch} onChange={event => { setPatientSearch(event.target.value); setFormData(prev => ({ ...prev, patient_id: "" })); }} />
                  <Form.Select disabled={patientsLoading} aria-label="Pilih pasien" value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })} required>
                    <option value="">{patientsLoading ? "Mencari pasien…" : "Pilih pasien dari hasil pencarian"}</option>
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
            <Button variant="primary" type="submit" disabled={saving || patientsLoading}>
              {saving ? "Menyimpan…" : "Daftarkan pasien"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationsPage;
