import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Modal, Form } from "react-bootstrap";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { doctorService } from "../../services/doctor.service";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const DoctorsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({ doctor_name: "", specialization: "" });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAll();
      setDoctors(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await doctorService.update(editingDoctor.id, formData);
        toast.success("Doctor updated successfully");
      } else {
        await doctorService.create(formData);
        toast.success("Doctor created successfully");
      }
      setShowModal(false);
      setEditingDoctor(null);
      setFormData({ doctor_name: "", specialization: "" });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save doctor");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await doctorService.delete(id);
      toast.success("Doctor deleted successfully");
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete doctor");
    }
  };

  const openModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({ doctor_name: doctor.doctor_name, specialization: doctor.specialization });
    } else {
      setEditingDoctor(null);
      setFormData({ doctor_name: "", specialization: "" });
    }
    setShowModal(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dokter</h2>
        {user?.role === "Administrator" && (
          <Button variant="primary" onClick={() => openModal()}>
            <i className="bi bi-plus-lg me-2"></i>
            Tambah Dokter
          </Button>
        )}
      </div>

      <Card>
        <Card.Body>
          {doctors.length === 0 ? (
            <EmptyState message="No doctors found" icon="bi-person-badge" />
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Dokter</th>
                  <th>Spesialisasi</th>
                  {user?.role === "Administrator" && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor, index) => (
                  <tr key={doctor.id}>
                    <td>{index + 1}</td>
                    <td>{doctor.doctor_name}</td>
                    <td>{doctor.specialization}</td>
                    {user?.role === "Administrator" && (
                      <td>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => openModal(doctor)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(doctor.id)}>
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
          <Modal.Title>{editingDoctor ? "Edit Dokter" : "Tambah Dokter Baru"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Nama Dokter <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="text" value={formData.doctor_name} onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Spesialisasi <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingDoctor ? "Update" : "Simpan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorsPage;
