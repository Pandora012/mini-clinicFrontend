import { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form } from "react-bootstrap";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { clinicService } from "../../services/clinic.service";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const ClinicsPage = () => {
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [formData, setFormData] = useState({ clinic_name: "" });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await clinicService.getAll();
      setClinics(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch clinics");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClinic) {
        await clinicService.update(editingClinic.id, formData);
        toast.success("Clinic updated successfully");
      } else {
        await clinicService.create(formData);
        toast.success("Clinic created successfully");
      }
      setShowModal(false);
      setEditingClinic(null);
      setFormData({ clinic_name: "" });
      fetchClinics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save clinic");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this clinic?")) return;

    try {
      await clinicService.delete(id);
      toast.success("Clinic deleted successfully");
      fetchClinics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete clinic");
    }
  };

  const openModal = (clinic = null) => {
    if (clinic) {
      setEditingClinic(clinic);
      setFormData({ clinic_name: clinic.clinic_name });
    } else {
      setEditingClinic(null);
      setFormData({ clinic_name: "" });
    }
    setShowModal(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Poli</h2>
        {user?.role === "Administrator" && (
          <Button variant="primary" onClick={() => openModal()}>
            <i className="bi bi-plus-lg me-2"></i>
            Tambah Poli
          </Button>
        )}
      </div>

      <Card>
        <Card.Body>
          {clinics.length === 0 ? (
            <EmptyState message="No clinics found" icon="bi-building" />
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Poli</th>
                  {user?.role === "Administrator" && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {clinics.map((clinic, index) => (
                  <tr key={clinic.id}>
                    <td>{index + 1}</td>
                    <td>{clinic.clinic_name}</td>
                    {user?.role === "Administrator" && (
                      <td>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => openModal(clinic)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(clinic.id)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingClinic ? "Edit Poli" : "Tambah Poli Baru"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Nama Poli <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="text" value={formData.clinic_name} onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingClinic ? "Update" : "Simpan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ClinicsPage;
