import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, Button, Row, Col, Table, Modal } from "react-bootstrap";
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

  useEffect(() => {
    if (id) {
      fetchRegistration();
      fetchExamination();
    }
  }, [id]);

  const fetchRegistration = async () => {
    try {
      const response = await registrationService.getById(id);
      setRegistration(response.data.data);
      setFormData((prev) => ({ ...prev, registration_id: id }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch registration");
    }
  };

  const fetchExamination = async () => {
    try {
      const response = await examinationService.getByRegistrationId(id);

      if (response.data.success) {
        setExamination(response.data.data);

        setFormData({
          registration_id: id,
          complaint: response.data.data.complaint || "",
          blood_pressure: response.data.data.blood_pressure || "",
          body_temperature: response.data.data.body_temperature || "",
          body_weight: response.data.data.body_weight || "",
          body_height: response.data.data.body_height || "",
          diagnosis: response.data.data.diagnosis || "",
          therapy_plan: response.data.data.therapy_plan || "",
        });

        if (response.data.data.medical_actions?.length) {
          setMedicalActions(response.data.data.medical_actions);
        }

        if (response.data.data.prescriptions?.length) {
          setPrescriptions(response.data.data.prescriptions);
        }
      }
    } catch (error) {
      console.error("No examination found yet");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let exam;

      if (examination) {
        await examinationService.update(examination.id, formData);
        exam = examination;
        toast.success("Examination updated successfully");
      } else {
        const response = await examinationService.create(formData);

        exam = response.data.data; // ambil examination yang baru dibuat

        setExamination(exam);

        toast.success("Examination created successfully");
      }

      await saveMedicalActions(exam.id);
      await savePrescriptions(exam.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save examination");
    }
  };

  const saveMedicalActions = async (examId) => {
    for (const action of medicalActions) {
      if (action.action_name) {
        await examinationService.addMedicalAction({
          examination_id: examId,
          action_name: action.action_name,
          notes: action.notes,
        });
      }
    }
  };

  const savePrescriptions = async (examId) => {
    for (const rx of prescriptions) {
      if (rx.medicine_name) {
        await examinationService.addPrescription({
          examination_id: examId,
          medicine_name: rx.medicine_name,
          dosage: rx.dosage,
          instruction: rx.instruction,
        });
      }
    }
  };

  const handleComplete = async () => {
    try {
      await examinationService.complete(examination?.id);
      toast.success("Examination completed successfully");
      navigate("/queue");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete examination");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pemeriksaan Dokter</h2>
        {registration && (
          <div className="text-muted">
            <strong>{registration.patient?.name}</strong> - {registration.queue_number}
          </div>
        )}
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">Subjective</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Label>Keluhan</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.complaint} onChange={(e) => setFormData({ ...formData, complaint: e.target.value })} />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">Objective</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tekanan Darah</Form.Label>
                  <Form.Control type="text" placeholder="120/80" value={formData.blood_pressure} onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Suhu (°C)</Form.Label>
                  <Form.Control type="text" placeholder="36.5" value={formData.body_temperature} onChange={(e) => setFormData({ ...formData, body_temperature: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Berat (kg)</Form.Label>
                  <Form.Control type="number" step="0.1" value={formData.body_weight} onChange={(e) => setFormData({ ...formData, body_weight: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tinggi (cm)</Form.Label>
                  <Form.Control type="number" value={formData.body_height} onChange={(e) => setFormData({ ...formData, body_height: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="bg-warning text-white">
            <h5 className="mb-0">Assessment</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Label>Diagnosa</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Plan</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
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
                    placeholder="Nama tindakan"
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
                    placeholder="Catatan"
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
                    placeholder="Nama obat"
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
                    placeholder="Dosis"
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
            Simpan SOAP
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
      </Form>
    </div>
  );
};

export default ExaminationPage;
