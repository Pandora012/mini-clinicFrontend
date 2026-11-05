import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Form, InputGroup, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/useAuth';
import { ROLES } from '../../constants';
import { queueService } from '../../services/queue.service';
import ErrorState from '../../components/common/ErrorState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './queue.css';

const statuses = [
  { name: 'Menunggu', label: 'Menunggu', icon: 'bi-clock', tone: 'waiting', detail: 'Belum dipanggil' },
  { name: 'Check In', label: 'Sudah check-in', icon: 'bi-person-check', tone: 'arrived', detail: 'Siap untuk diperiksa' },
  { name: 'Pemeriksaan', label: 'Dalam pemeriksaan', icon: 'bi-clipboard-pulse', tone: 'examining', detail: 'Sedang dilayani dokter' },
  { name: 'Selesai', label: 'Selesai dilayani', icon: 'bi-check2-circle', tone: 'completed', detail: 'Pelayanan telah selesai' },
];
const getTone = status => statuses.find(item => item.name === status)?.tone || 'waiting';
const dateFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
const timeFormatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });

const QueuePage = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [clinic, setClinic] = useState('');
  const request = useRef(null);
  const mounted = useRef(false);
  const actionLock = useRef(false);

  const fetchQueues = useCallback(async () => {
    if (!mounted.current) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setRefreshing(true);
    try {
      const response = await queueService.getTodayQueues(controller.signal);
      if (!controller.signal.aborted) {
        setQueues(response.data.data);
        setError('');
        setUpdatedAt(new Date());
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(err.response?.data?.message || 'Antrean belum dapat dimuat. Periksa koneksi dan coba lagi.');
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void fetchQueues();
    const interval = setInterval(() => { if (!actionLock.current) void fetchQueues(); }, 15000);
    return () => { mounted.current = false; clearInterval(interval); request.current?.abort(); };
  }, [fetchQueues]);

  const runAction = async work => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    // A response from before this change must not overwrite the new queue state.
    request.current?.abort();
    try {
      await work();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Antrean gagal diperbarui. Silakan coba lagi.');
    } finally {
      await fetchQueues();
      actionLock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const handleNextQueue = () => runAction(async () => {
    const response = await queueService.callNextQueue();
    const next = response.data.data;
    if (next) toast.success(`Antrean ${next.queue_number} berhasil dipanggil.`);
    else toast.info('Seluruh antrean yang menunggu sudah dipanggil.');
  });
  const handleStatusUpdate = (id, status) => runAction(async () => {
    await queueService.updateStatus(id, status);
    toast.success(status === 'Check In' ? 'Pasien berhasil check-in.' : 'Pasien masuk ke tahap pemeriksaan.');
  });

  const rows = queues || [];
  const counts = Object.fromEntries(statuses.map(status => [status.name, rows.filter(row => row.status === status.name).length]));
  const next = rows.find(row => row.status === 'Menunggu');
  const clinics = [...new Map(rows.filter(row => row.clinic).map(row => [String(row.clinic_id), row.clinic.clinic_name])).entries()];
  const query = search.trim().toLocaleLowerCase('id-ID');
  const visible = rows.filter(row => (filter === 'Semua' || row.status === filter)
    && (!clinic || String(row.clinic_id) === clinic)
    && (!query || [row.queue_number, row.patient?.name, row.patient?.medical_record_number].some(value => value?.toLocaleLowerCase('id-ID').includes(query))));
  const resetFilters = () => { setFilter('Semua'); setSearch(''); setClinic(''); };
  const unavailable = !!error || queues === null;

  return (
    <div className="queue-page">
      <header className="queue-heading">
        <div><p className="page-intro">Ruang pelayanan</p><h2>Antrean hari ini</h2><p className="queue-heading-description">Satu pandangan untuk setiap giliran pelayanan.</p></div>
        <div className="queue-day"><i className="bi bi-calendar3" aria-hidden="true" /><span>{dateFormatter.format(new Date())}</span></div>
      </header>

      <section className="queue-overview" aria-label="Ringkasan antrean">
        <div className="next-patient">
          <div className="next-patient-top"><span><i className="bi bi-ticket-perforated" aria-hidden="true" />Antrean berikutnya</span><span className="next-patient-count">{unavailable ? '—' : `${counts.Menunggu} menunggu`}</span></div>
          <div className="next-patient-body">
            <strong className={`next-patient-number${next && !unavailable ? '' : ' is-empty'}`}>{unavailable ? '—' : next?.queue_number || '—'}</strong>
            <div className="next-patient-info"><h3>{error ? 'Data belum tersedia' : queues === null ? 'Memuat antrean…' : next ? next.patient?.name || 'Pasien terdaftar' : rows.length ? 'Semua giliran sudah dipanggil' : 'Siap menyambut pasien'}</h3><p>{error ? 'Perbarui data untuk melanjutkan pelayanan.' : next && !unavailable ? `${next.clinic?.clinic_name || 'Poli belum tersedia'} · ${next.doctor?.doctor_name || 'Dokter belum tersedia'}` : 'Giliran pasien berikutnya akan muncul di sini.'}</p></div>
          </div>
          <div className="next-patient-bottom"><span><i className="bi bi-arrow-right-circle" aria-hidden="true" />Panggil sesuai urutan kedatangan</span><Button variant="light" disabled={busy || refreshing || unavailable || !next} onClick={handleNextQueue}><i className={`bi ${busy ? 'bi-hourglass-split' : 'bi-bell'}`} aria-hidden="true" />{busy ? 'Memproses…' : 'Panggil berikutnya'}</Button></div>
        </div>
        <div className="queue-metrics">{statuses.map(status => <article className={`queue-metric ${status.tone}`} key={status.name}><span className="queue-metric-icon"><i className={`bi ${status.icon}`} aria-hidden="true" /></span><div><h3>{status.label}</h3><strong>{unavailable ? '—' : counts[status.name]}</strong><p>{status.detail}</p></div></article>)}</div>
      </section>

      <section className="queue-list" aria-labelledby="queue-list-title">
        <div className="queue-list-heading"><div><h3 id="queue-list-title">Daftar antrean <span>{unavailable ? '—' : rows.length}</span></h3><p>Pantau giliran dan lanjutkan pelayanan pasien.</p></div><Button variant="outline-secondary" size="sm" onClick={() => { void fetchQueues(); }} disabled={refreshing || busy}><i className={`bi bi-arrow-clockwise${refreshing ? ' queue-refresh-spin' : ''}`} aria-hidden="true" />{refreshing ? 'Memperbarui…' : 'Perbarui'}</Button></div>
        <div className="queue-toolbar"><div className="queue-filters" aria-label="Filter status antrean">{['Semua', ...statuses.map(status => status.name)].map(status => <button type="button" className={`queue-filter${filter === status ? ' is-selected' : ''}`} aria-pressed={filter === status} key={status} onClick={() => setFilter(status)}>{status}<span>{unavailable ? '—' : status === 'Semua' ? rows.length : counts[status]}</span></button>)}</div></div>
        {rows.length > 0 ? <div className="queue-search"><InputGroup><InputGroup.Text><i className="bi bi-search" aria-hidden="true" /></InputGroup.Text><Form.Control aria-label="Cari pasien dalam antrean" placeholder="Cari nama pasien, nomor RM, atau antrean…" value={search} onChange={event => setSearch(event.target.value)} /></InputGroup><Form.Select aria-label="Filter poli" value={clinic} onChange={event => setClinic(event.target.value)}><option value="">Semua poli</option>{clinics.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</Form.Select></div> : null}
        {error ? <div className="queue-list-message"><ErrorState message={error} onRetry={() => { void fetchQueues(); }} /></div> : queues === null ? <LoadingSpinner text="Menyiapkan daftar antrean…" /> : visible.length === 0 ? <div className="queue-empty">
          <div className="queue-empty-art" aria-hidden="true"><span className="queue-empty-ticket ticket-back" /><span className="queue-empty-ticket ticket-front"><i className={`bi ${rows.length ? 'bi-search' : 'bi-people'}`} /><span /><span /></span><span className="queue-empty-check"><i className={`bi ${rows.length ? 'bi-filter' : 'bi-plus'}`} /></span></div>
          <h4>{rows.length ? 'Tidak ada antrean yang cocok' : 'Antrean hari ini masih kosong'}</h4>
          <p>{rows.length ? 'Coba kata kunci lain atau ubah filter untuk menemukan pasien.' : 'Mulai dari pendaftaran pasien. Nomor antrean akan tersusun otomatis dan siap dipanggil.'}</p>
          {rows.length ? <Button variant="outline-primary" onClick={resetFilters}>Reset pencarian dan filter</Button> : <Link className="btn btn-primary" to="/registrations"><i className="bi bi-plus-lg" aria-hidden="true" />Daftarkan pasien</Link>}
        </div> : <div className="queue-table"><Table responsive hover><thead><tr><th>Antrean</th><th>Pasien</th><th>Dokter & poli</th><th>Pembayaran</th><th>Status</th><th className="text-end">Pelayanan</th></tr></thead><tbody>{visible.map(row => <tr key={row.id}><td><span className="queue-row-number">{row.queue_number}</span></td><td><div className="queue-patient-cell"><span className="queue-patient-avatar" aria-hidden="true">{row.patient?.name?.charAt(0).toUpperCase() || 'P'}</span><div><strong>{row.patient?.name || 'Pasien terdaftar'}</strong><small>{row.patient?.medical_record_number || '—'}</small></div></div></td><td><strong className="queue-doctor-name">{row.doctor?.doctor_name || '—'}</strong><small className="queue-clinic-name">{row.clinic?.clinic_name || '—'}</small></td><td><span className="queue-payment">{row.payment_type}</span></td><td><span className={`queue-status ${getTone(row.status)}`}><span />{row.status}</span></td><td className="text-end">{row.status === 'Menunggu' ? <Button variant="outline-primary" size="sm" disabled={busy || refreshing} onClick={() => handleStatusUpdate(row.id, 'Check In')}>Check-in</Button> : row.status === 'Check In' ? <Button variant="outline-primary" size="sm" disabled={busy || refreshing} onClick={() => handleStatusUpdate(row.id, 'Pemeriksaan')}>Mulai pemeriksaan</Button> : row.status === 'Pemeriksaan' && user?.role === ROLES.ADMINISTRATOR ? <Link className="btn btn-sm btn-primary" to={`/examinations/${row.id}`}>Buka pemeriksaan</Link> : <Link className="queue-detail-link" to={`/patients/detail/${row.patient_id}`}>Detail pasien<i className="bi bi-chevron-right" aria-hidden="true" /></Link>}</td></tr>)}</tbody></Table></div>}
        <footer className="queue-list-footer"><span><i className="bi bi-arrow-repeat" aria-hidden="true" />{error ? 'Pembaruan tertunda' : 'Diperbarui otomatis setiap 15 detik'}</span><span>{updatedAt ? `Pembaruan terakhir ${timeFormatter.format(updatedAt)}` : 'Menunggu data antrean'}</span></footer>
      </section>
    </div>
  );
};
export default QueuePage;
