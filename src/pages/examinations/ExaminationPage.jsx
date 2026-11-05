import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import ErrorState from "../../components/common/ErrorState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { examinationService } from "../../services/examination.service";
import { registrationService } from "../../services/registration.service";
import { toast } from "react-toastify";

const ExaminationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [examination, setExamination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicalActions, setMedicalActions] = useState([{ action_name: "", notes: "" }]);
  const [prescriptions, setPrescriptions] = useState([{ medicine_name: "", dosage: "", instruction: "" }]);
  const [formData, setFormData] = useState({
    registration_id: id,
    complaint: "",
    blood_pressure: "",
    body_temperature: "",
    body_weight: "",
    body_height: "",
    diagnosis: "",
    therapy_plan: "",
  });

  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError('');
    Promise.all([registrationService.getById(id), examinationService.getByRegistrationId(id)])
      .then(([visit, response]) => {
        if (!active) return;
        const record = response.data.data;
        setRegistration(visit.data.data);
        setExamination(record);
        setFormData({ registration_id: id, complaint: record?.complaint || visit.data.data.initial_complaint || '', blood_pressure: record?.blood_pressure || '', body_temperature: record?.body_temperature || '', body_weight: record?.body_weight || '', body_height: record?.body_height || '', diagnosis: record?.diagnosis || '', therapy_plan: record?.therapy_plan || '' });
        setMedicalActions((record?.medical_actions || []).map(action => ({ ...action, notes: action.notes || '' })));
        setPrescriptions(record?.prescriptions || []);
      }).catch(error => { if (active) setLoadError(error.response?.data?.message || 'Data pemeriksaan gagal dimuat.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const persist = async () => {
    const payload = { ...formData,
      medical_actions: medicalActions.filter(action => action.action_name.trim()),
      prescriptions: prescriptions.filter(rx => rx.medicine_name.trim()),
    };
    const response = examination ? await examinationService.update(examination.id, payload) : await examinationService.create(payload);
    setExamination(response.data.data);
    return response.data.data;
  };
  const handleSubmit = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try { await persist(); toast.success('Pemeriksaan berhasil disimpan.'); }
    catch (error) { toast.error(error.response?.data?.message || 'Pemeriksaan gagal disimpan.'); }
    finally { setSaving(false); }
  };
  const handleComplete = async () => {
    if (saving) return;
    if (!formData.diagnosis.trim()) { toast.error('Lengkapi diagnosis sebelum menyelesaikan pemeriksaan.'); return; }
    setSaving(true);
    try {
      const exam = await persist();
      await examinationService.complete(exam.id);
      toast.success('Pemeriksaan selesai.');
      navigate('/examinations');
    } catch (error) { toast.error(error.response?.data?.message || 'Pemeriksaan belum dapat diselesaikan.'); }
    finally { setSaving(false); }
  };
  if (loading) {
    return <LoadingSpinner />;
  }

  if (loadError) return <ErrorState message={loadError} />;
  if (!registration) return <ErrorState message="Pendaftaran tidak ditemukan." />;
  if (!["Check In", "Pemeriksaan"].includes(registration.status)) return <ErrorState message="Pemeriksaan hanya tersedia untuk pasien yang sudah check in dan belum selesai." />;
  return (
    <div className="examination-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pemeriksaan Dokter</h2>
        {registration && (
          <div className="text-muted">
            <strong>{registration.patient?.name}</strong> - {registration.queue_number}
          </div>
        )}
      </div>

      <Form onSubmit={handleSubmit}><fieldset disabled={saving}>
        <Card className="mb-4">
          <Card.Header className="exam-section-header">
            <h5 className="mb-0">Keluhan pasien</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group controlId="exam-complaint">
              <Form.Label>Keluhan</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.complaint} onChange={(e) => setFormData({ ...formData, complaint: e.target.value })} />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="exam-section-header">
            <h5 className="mb-0">Tanda vital</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group controlId="exam-blood-pressure" className="mb-3">
                  <Form.Label>Tekanan Darah</Form.Label>
                  <Form.Control type="text" placeholder="120/80" value={formData.blood_pressure} onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="exam-temperature" className="mb-3">
                  <Form.Label>Suhu (°C)</Form.Label>
                  <Form.Control type="text" placeholder="36.5" value={formData.body_temperature} onChange={(e) => setFormData({ ...formData, body_temperature: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="exam-weight" className="mb-3">
                  <Form.Label>Berat (kg)</Form.Label>
                  <Form.Control type="number" step="0.1" value={formData.body_weight} onChange={(e) => setFormData({ ...formData, body_weight: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="exam-height" className="mb-3">
                  <Form.Label>Tinggi (cm)</Form.Label>
                  <Form.Control type="number" value={formData.body_height} onChange={(e) => setFormData({ ...formData, body_height: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="exam-section-header">
            <h5 className="mb-0">Diagnosis</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group controlId="exam-diagnosis">
              <Form.Label>Diagnosa</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="exam-section-header">
            <h5 className="mb-0">Rencana terapi</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group controlId="exam-therapy" className="mb-3">
              <Form.Label>Rencana Terapi</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.therapy_plan} onChange={(e) => setFormData({ ...formData, therapy_plan: e.target.value })} />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Tindakan Medis</h5>
              <Button size="sm" variant="outline-primary" onClick={() => setMedicalActions([...medicalActions, { action_name: "", notes: "" }])}>
                <i className="bi bi-plus"></i> Tambah
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {medicalActions.map((action, index) => (
              <Row key={index} className="mb-2">
                <Col md={6}>
                  <Form.Control
                    aria-label="Nama tindakan" placeholder="Nama tindakan"
                    value={action.action_name}
                    onChange={(e) => {
                      const updated = [...medicalActions];
                      updated[index].action_name = e.target.value;
                      setMedicalActions(updated);
                    }}
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    aria-label="Catatan tindakan" placeholder="Catatan"
                    value={action.notes}
                    onChange={(e) => {
                      const updated = [...medicalActions];
                      updated[index].notes = e.target.value;
                      setMedicalActions(updated);
                    }}
                  />
                </Col>
                <Col md={1}>
                  <Button variant="danger" size="sm" onClick={() => setMedicalActions(medicalActions.filter((_, i) => i !== index))}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            ))}
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Resep Obat</h5>
              <Button size="sm" variant="outline-primary" onClick={() => setPrescriptions([...prescriptions, { medicine_name: "", dosage: "", instruction: "" }])}>
                <i className="bi bi-plus"></i> Tambah
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {prescriptions.map((rx, index) => (
              <Row key={index} className="mb-2">
                <Col md={4}>
                  <Form.Control
                    aria-label="Nama obat" placeholder="Nama obat"
                    value={rx.medicine_name}
                    onChange={(e) => {
                      const updated = [...prescriptions];
                      updated[index].medicine_name = e.target.value;
                      setPrescriptions(updated);
                    }}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    aria-label="Dosis obat" required placeholder="Dosis"
                    value={rx.dosage}
                    onChange={(e) => {
                      const updated = [...prescriptions];
                      updated[index].dosage = e.target.value;
                      setPrescriptions(updated);
                    }}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    placeholder="Instruksi"
                    value={rx.instruction}
                    onChange={(e) => {
                      const updated = [...prescriptions];
                      updated[index].instruction = e.target.value;
                      setPrescriptions(updated);
                    }}
                  />
                </Col>
                <Col md={1}>
                  <Button variant="danger" size="sm" onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== index))}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            ))}
          </Card.Body>
        </Card>

        <div className="d-flex gap-2 mb-4">
          <Button variant="primary" type="submit">
            <i className="bi bi-save me-2"></i>
            {saving ? "Menyimpan…" : "Simpan pemeriksaan"}
          </Button>
          {examination && (
            <Button variant="success" onClick={handleComplete}>
              <i className="bi bi-check-circle me-2"></i>
              Selesai Pemeriksaan
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
      </fieldset></Form>
    </div>
  );
};

export default ExaminationPage;
