import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/useAuth';
import { ROLES } from '../../constants';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { doctorService } from '../../services/doctor.service';
import '../../components/common/directory.css';

const fields = [
  { key: 'doctor_name', label: 'Nama dokter', placeholder: 'Nama lengkap dokter' },
  { key: 'specialization', label: 'Spesialisasi', placeholder: 'Misalnya, Penyakit Dalam' },
];

function DoctorCard({ doctor, onEdit, onDelete }) {
  const { doctor_name: name, specialization } = doctor;
  const initials = name.trim().replace(/^dr\.?\s+/i, '').split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return (
    <article className="directory-card">
      <div className="doctor-id-strip" aria-hidden="true"><i className="bi bi-person-vcard" /> MINI CLINIC <span /></div>
      <div className="directory-card-body">
        <span className="doctor-monogram" aria-hidden="true">{initials}</span>
        <h3>{name}</h3>
        <span className="doctor-specialty"><i aria-hidden="true" className="bi bi-heart-pulse" />{specialization}</span>
      </div>
      {onEdit && <footer>
        <button type="button" aria-label={`Edit profil ${name}`} onClick={() => onEdit(doctor)}><i aria-hidden="true" className="bi bi-pencil" /> Edit profil</button>
        <button type="button" className="directory-remove" aria-label={`Hapus ${name}`} onClick={() => onDelete(doctor)}><i aria-hidden="true" className="bi bi-trash3" /> Hapus</button>
      </footer>}
    </article>
  );
}

export default function DoctorsPage() {
  const { user } = useAuth();
  const admin = user?.role === ROLES.ADMINISTRATOR;
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(null);
  const [remove, setRemove] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await doctorService.getAll();
      setDoctors(response.data.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    const data = { doctor_name: form.doctor_name.trim(), specialization: form.specialization.trim() };
    if (!data.doctor_name || !data.specialization) return;
    setBusy(true);
    try {
      if (form.id) await doctorService.update(form.id, data);
      else await doctorService.create(data);
      toast.success(form.id ? 'Profil dokter diperbarui.' : 'Dokter ditambahkan.');
      setForm(null);
      if (!form.id) setQuery('');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profil dokter belum berhasil disimpan.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    try {
      await doctorService.delete(remove.id);
      setRemove(null);
      toast.success('Profil dokter dihapus.');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profil dokter belum berhasil dihapus.');
    } finally {
      setBusy(false);
    }
  }

  const term = query.trim().toLowerCase();
  const visible = doctors.filter(d => [d.doctor_name, d.specialization].some(value => value.toLowerCase().includes(term)));
  return (
    <div className="service-directory">
      <header className="directory-banner">
        <div>
          <span className="directory-kicker"><i aria-hidden="true" className="bi bi-hospital" /> Tim klinik</span>
          <h1>Direktori dokter</h1>
          <p>Temukan dokter berdasarkan nama atau bidang spesialisasinya.</p>
        </div>
        {admin && <Button variant="light" onClick={() => setForm({ doctor_name: '', specialization: '' })}><i aria-hidden="true" className="bi bi-plus-lg me-2" />Tambah dokter</Button>}
      </header>
      <section aria-labelledby="doctor-heading">
        <div className="directory-toolbar">
          <h2 id="doctor-heading">Daftar dokter {!loading && !loadError && <small>{visible.length}</small>}</h2>
          <div className="directory-search">
            <i aria-hidden="true" className="bi bi-search" />
            <Form.Control type="search" aria-label="Cari nama atau spesialisasi dokter" placeholder="Cari nama atau spesialisasi" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : loadError ? <ErrorState message="Direktori dokter belum dapat dimuat." onRetry={load} /> :
          visible.length ? <div className="directory-grid">
            {visible.map(d => <DoctorCard key={d.id} doctor={d} onEdit={admin ? setForm : null} onDelete={setRemove} />)}
          </div> : <div className="directory-empty">
            <i aria-hidden="true" className={term ? 'bi bi-search' : 'bi bi-person-vcard'} />
            <h3>{term ? 'Dokter tidak ditemukan' : 'Belum ada profil dokter'}</h3>
            <p>{term ? 'Coba nama atau spesialisasi lain.' : 'Profil dokter akan muncul di sini setelah ditambahkan.'}</p>
            {term && <Button variant="outline-primary" size="sm" onClick={() => setQuery('')}>Hapus pencarian</Button>}
          </div>}
      </section>
      <Modal centered show={!!form} onHide={() => !busy && setForm(null)} aria-labelledby="doctor-form-title">
        <Modal.Header closeButton={!busy}><Modal.Title id="doctor-form-title">{form?.id ? 'Edit profil dokter' : 'Tambah dokter'}</Modal.Title></Modal.Header>
        {form && <Form onSubmit={save}>
          <Modal.Body>
            {fields.map(({ key, label, placeholder }, i) => <Form.Group key={key} controlId={key} className={i === 0 ? 'mb-3' : undefined}>
              <Form.Label>{label}</Form.Label>
              <Form.Control autoFocus={i === 0} disabled={busy} required maxLength={100} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </Form.Group>)}
          </Modal.Body>
          <Modal.Footer><Button variant="light" disabled={busy} onClick={() => setForm(null)}>Batal</Button>
            <Button type="submit" disabled={busy || !form.doctor_name.trim() || !form.specialization.trim()}>{busy ? 'Menyimpan…' : 'Simpan profil'}</Button>
          </Modal.Footer>
        </Form>}
      </Modal>
      <Modal centered show={!!remove} onHide={() => !busy && setRemove(null)} aria-labelledby="doctor-delete-title">
        <Modal.Header closeButton={!busy}><Modal.Title id="doctor-delete-title">Hapus profil dokter?</Modal.Title></Modal.Header>
        <Modal.Body>Profil <strong>{remove?.doctor_name}</strong> akan dihapus dari direktori.</Modal.Body>
        <Modal.Footer><Button autoFocus variant="light" disabled={busy} onClick={() => setRemove(null)}>Batal</Button>
          <Button variant="danger" disabled={busy} onClick={confirmDelete}>{busy ? 'Menghapus…' : 'Hapus profil'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
