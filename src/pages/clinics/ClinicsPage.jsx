import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROLES } from '../../constants';
import { useAuth } from '../../contexts/useAuth';
import { clinicService } from '../../services/clinic.service';
import '../../components/common/directory.css';
import './clinics.css';

function ClinicCard({ clinic, admin, onEdit, onDelete }) {
  return (
    <article className="directory-card poli-card">
      <div className="directory-card-body poli-sign">
        <span className="poli-icon" aria-hidden="true"><i className="bi bi-hospital" /></span>
        <div>
          <span className="poli-label">Poliklinik</span>
          <h3>{clinic.clinic_name}</h3>
        </div>
      </div>
      {admin && (
        <footer>
          <button type="button" aria-label={`Edit ${clinic.clinic_name}`} onClick={() => onEdit(clinic)}>
            <i className="bi bi-pencil" aria-hidden="true" /> Edit poli
          </button>
          <button type="button" className="directory-remove" aria-label={`Hapus ${clinic.clinic_name}`} onClick={() => onDelete(clinic)}>
            <i className="bi bi-trash3" aria-hidden="true" /> Hapus
          </button>
        </footer>
      )}
    </article>
  );
}

export default function ClinicsPage() {
  const { user } = useAuth();
  const admin = user?.role === ROLES.ADMINISTRATOR;
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function loadClinics() {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await clinicService.getAll();
      setClinics(response.data.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClinics(); }, []);

  async function saveClinic(event) {
    event.preventDefault();
    const name = form.clinic_name.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const data = { clinic_name: name };
      if (form.id) {
        await clinicService.update(form.id, data);
      } else {
        await clinicService.create(data);
        setQuery('');
      }
      toast.success(form.id ? 'Nama poli diperbarui.' : 'Poli ditambahkan.');
      setForm(null);
      await loadClinics();
    } catch {
      toast.error('Poli belum berhasil disimpan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteClinic() {
    if (!deleteTarget || busy) return;
    setBusy(true);
    try {
      await clinicService.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Poli dihapus.');
      await loadClinics();
    } catch {
      toast.error('Poli belum berhasil dihapus.');
    } finally {
      setBusy(false);
    }
  }

  const term = query.trim().toLowerCase();
  const visible = clinics.filter(clinic => clinic.clinic_name.toLowerCase().includes(term));
  let content;
  if (loading) {
    content = <LoadingSpinner />;
  } else if (loadError) {
    content = <ErrorState message="Daftar poli belum dapat dimuat." onRetry={loadClinics} />;
  } else if (visible.length) {
    content = (
      <div className="directory-grid">
        {visible.map(clinic => (
          <ClinicCard key={clinic.id} clinic={clinic} admin={admin} onEdit={setForm} onDelete={setDeleteTarget} />
        ))}
      </div>
    );
  } else {
    content = (
      <div className="directory-empty">
        <i aria-hidden="true" className={term ? 'bi bi-search' : 'bi bi-hospital'} />
        <h3>{term ? 'Poli tidak ditemukan' : 'Belum ada poli terdaftar'}</h3>
        <p>{term ? 'Coba gunakan nama poli lain.' : 'Poli yang ditambahkan akan muncul di sini.'}</p>
        {term && <Button size="sm" variant="outline-primary" onClick={() => setQuery('')}>Hapus pencarian</Button>}
      </div>
    );
  }

  return (
    <div className="service-directory">
      <header className="directory-banner">
        <div>
          <span className="directory-kicker"><i className="bi bi-signpost-split" aria-hidden="true" /> Unit pelayanan</span>
          <h1>Direktori poli</h1>
          <p>Temukan poli tujuan untuk pendaftaran pasien.</p>
        </div>
        {admin && (
          <Button variant="light" onClick={() => setForm({ clinic_name: '' })}>
            <i className="bi bi-plus-lg me-2" aria-hidden="true" />Tambah poli
          </Button>
        )}
      </header>
      <section aria-labelledby="poli-heading">
        <div className="directory-toolbar">
          <h2 id="poli-heading">Daftar poli {!loading && !loadError && <small>{visible.length}</small>}</h2>
          <div className="directory-search">
            <i aria-hidden="true" className="bi bi-search" />
            <Form.Control type="search" aria-label="Cari nama poli" placeholder="Cari nama poli" value={query} onChange={event => setQuery(event.target.value)} />
          </div>
        </div>
        {content}
      </section>

      <Modal centered show={!!form} onHide={() => !busy && setForm(null)} aria-labelledby="poli-form-title">
        <Modal.Header closeButton={!busy} closeLabel="Tutup">
          <Modal.Title id="poli-form-title">{form?.id ? 'Edit poli' : 'Tambah poli'}</Modal.Title>
        </Modal.Header>
        {form && (
          <Form onSubmit={saveClinic}>
            <Modal.Body>
              <Form.Group controlId="poli-name">
                <Form.Label>Nama poli</Form.Label>
                <Form.Control autoFocus required maxLength={100} disabled={busy} placeholder="Misalnya, Poli Gigi" value={form.clinic_name}
                  onChange={event => setForm({ ...form, clinic_name: event.target.value })} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" disabled={busy} onClick={() => setForm(null)}>Batal</Button>
              <Button type="submit" disabled={busy || !form.clinic_name.trim()}>{busy ? 'Menyimpan…' : 'Simpan poli'}</Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal>
      <Modal centered show={!!deleteTarget} onHide={() => !busy && setDeleteTarget(null)} aria-labelledby="poli-delete-title">
        <Modal.Header closeButton={!busy} closeLabel="Tutup"><Modal.Title id="poli-delete-title">Hapus poli?</Modal.Title></Modal.Header>
        <Modal.Body><strong>{deleteTarget?.clinic_name}</strong> akan dihapus dari direktori poli.</Modal.Body>
        <Modal.Footer>
          <Button autoFocus variant="light" disabled={busy} onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" disabled={busy} onClick={deleteClinic}>{busy ? 'Menghapus…' : 'Hapus poli'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
