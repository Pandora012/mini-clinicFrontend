import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Table, Button, Form, InputGroup, Modal } from "react-bootstrap";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { patientService } from "../../services/patient.service";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [pagination.page, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      });
      setPatients(response.data.data);

      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await patientService.delete(selectedPatient.id);
      toast.success("Patient deleted successfully");
      setShowDeleteModal(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete patient");
    }
  };

  const confirmDelete = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pasien</h2>
        <Button variant="primary" onClick={() => navigate("/patients/add")}>
          <i className="bi bi-plus-lg me-2"></i>
          Tambah Pasien
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control placeholder="Search by name, NIK, or medical record number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {patients.length === 0 ? (
            <EmptyState message="No patients found" icon="bi-people" />
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nomor RM</th>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th>Jenis Kelamin</th>
                    <th>Telepon</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient, index) => (
                    <tr key={patient.id}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td>{patient.medical_record_number}</td>
                      <td>{patient.nik}</td>
                      <td>{patient.name}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.phone}</td>
                      <td>
                        <Button variant="info" size="sm" className="me-2" onClick={() => navigate(`/patients/detail/${patient.id}`)}>
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/patients/edit/${patient.id}`)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => confirmDelete(patient)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {pagination.total > pagination.limit && (
                <div className="d-flex justify-content-center mt-3">
                  <Button variant="outline-primary" disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)}>
                    Previous
                  </Button>
                  <span className="mx-3 align-self-center">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <Button variant="outline-primary" disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => handlePageChange(pagination.page + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>Apakah Anda yakin ingin menghapus pasien "{selectedPatient?.name}"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PatientsPage;
