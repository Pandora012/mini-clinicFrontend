import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { patientService } from '../../services/patient.service';
import { useAuth } from '../../contexts/useAuth';
import { ROLES } from '../../constants';
import { toast } from 'react-toastify';

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => { setQuery(searchTerm.trim()); setPagination(prev => ({ ...prev, page: 1 })); }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    patientService.getAll({ page: pagination.page, limit: pagination.limit, search: query }, controller.signal)
      .then(response => { if (!controller.signal.aborted) { setPatients(response.data.data); setPagination(prev => ({ ...prev, total: response.data.pagination.total })); } })
      .catch(err => { if (!controller.signal.aborted) setError(err.response?.data?.message || 'Daftar pasien belum dapat dimuat.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [pagination.page, pagination.limit, query, revision]);
  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await patientService.delete(selectedPatient.id);
      toast.success('Data pasien berhasil dihapus.');
      setSelectedPatient(null);
      if (patients.length === 1 && pagination.page > 1) setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      else setRevision(value => value + 1);
    } catch (err) { toast.error(err.response?.data?.message || 'Data pasien gagal dihapus.'); }
    finally { setDeleting(false); }
  };
  return <div>
    <div className="page-heading"><div><p className="page-intro">Data & rekam medis</p><h2>Pasien</h2><p className="text-muted mb-0">Temukan data pasien dan riwayat pelayanannya.</p></div><Link to="/patients/add" className="btn btn-primary"><i className="bi bi-plus-lg me-2" />Tambah pasien</Link></div>
    <Card><Card.Body><div className="table-toolbar"><InputGroup><InputGroup.Text><i className="bi bi-search" /></InputGroup.Text><Form.Control aria-label="Cari pasien" placeholder="Cari nama, NIK, atau nomor rekam medis…" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />{searchTerm ? <Button variant="outline-secondary" aria-label="Hapus pencarian" onClick={() => setSearchTerm('')}><i className="bi bi-x-lg" /></Button> : null}</InputGroup><span className="count-pill">{loading ? 'Memuat…' : `${pagination.total} pasien`}</span></div>
      <div aria-busy={loading}>{loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={() => setRevision(value => value + 1)} /> : !patients.length ? <EmptyState message={query ? 'Tidak ada pasien yang cocok. Coba kata kunci lain.' : 'Belum ada pasien. Tambahkan pasien untuk memulai.'} icon="bi-people" /> : <>
        <Table responsive hover><thead><tr><th>Nomor RM</th><th>Pasien</th><th>NIK</th><th>Jenis kelamin</th><th>Telepon</th><th>Aksi</th></tr></thead><tbody>{patients.map(patient => <tr key={patient.id}><td><span className="record-number">{patient.medical_record_number}</span></td><td><strong>{patient.name}</strong></td><td>{patient.nik}</td><td>{patient.gender}</td><td>{patient.phone || '—'}</td><td><div className="d-flex gap-2"><Link className="btn btn-sm btn-outline-primary" to={`/patients/detail/${patient.id}`} aria-label={`Lihat ${patient.name}`}><i className="bi bi-eye" /></Link><Link className="btn btn-sm btn-outline-secondary" to={`/patients/edit/${patient.id}`} aria-label={`Edit ${patient.name}`}><i className="bi bi-pencil" /></Link>{user?.role === ROLES.ADMINISTRATOR ? <Button variant="outline-danger" size="sm" onClick={() => setSelectedPatient(patient)} aria-label={`Hapus ${patient.name}`}><i className="bi bi-trash" /></Button> : null}</div></td></tr>)}</tbody></Table>
        <div className="table-pagination"><span>Halaman {pagination.page} dari {Math.max(1, Math.ceil(pagination.total / pagination.limit))}</span><div className="d-flex gap-2"><Button variant="outline-secondary" size="sm" disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>Sebelumnya</Button><Button variant="outline-secondary" size="sm" disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>Berikutnya</Button></div></div>
      </>}</div></Card.Body></Card>
    <Modal show={!!selectedPatient} onHide={() => { if (!deleting) setSelectedPatient(null); }} centered><Modal.Header closeButton={!deleting}><Modal.Title>Hapus data pasien?</Modal.Title></Modal.Header><Modal.Body>Data pasien <strong>{selectedPatient?.name}</strong> akan dihapus. Pasien dengan riwayat kunjungan tidak dapat dihapus.</Modal.Body><Modal.Footer><Button variant="light" disabled={deleting} onClick={() => setSelectedPatient(null)}>Batal</Button><Button variant="danger" disabled={deleting} onClick={handleDelete}>{deleting ? 'Menghapus…' : 'Hapus pasien'}</Button></Modal.Footer></Modal>
  </div>;
};
export default PatientsPage;
