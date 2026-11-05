import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Table } from 'react-bootstrap';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { dashboardService } from '../../services/dashboard.service';
import { queueService } from '../../services/queue.service';
import { useAuth } from '../../contexts/useAuth';
import { ROLES } from '../../constants';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    Promise.all([dashboardService.getStats(controller.signal), queueService.getTodayQueues(controller.signal)])
      .then(([stats, queue]) => { if (!controller.signal.aborted) setData({ stats: stats.data.data, queues: queue.data.data }); })
      .catch(err => { if (!controller.signal.aborted) setError(err.response?.data?.message || 'Ringkasan pelayanan belum dapat dimuat.'); });
    return () => controller.abort();
  }, [revision]);
  const isDoctor = user?.role === ROLES.DOKTER;
  const stats = error ? null : data?.stats;
  const progress = stats?.totalQueuesToday ? Math.round(stats.completedPatients / stats.totalQueuesToday * 100) : 0;
  const active = data?.queues.filter(queue => queue.status !== 'Selesai') || [];
  return (
    <div className="dashboard-page">
      <div className="page-heading"><div><p className="page-intro">Ruang pelayanan</p><h2>Dashboard klinik</h2></div><span className="date-chip"><i className="bi bi-calendar3" />{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date())}</span></div>
      <section className="daily-brief">
        <div className="daily-brief-copy"><span className="brief-icon"><i className="bi bi-heart-pulse" /></span><h1>Selamat datang, {user?.name || 'tim klinik'}.</h1><p>Setiap pasien punya cerita. Mari mulai pelayanan hari ini dengan lebih terarah.</p><Link className="btn btn-light" to={isDoctor ? '/examinations' : '/registrations'}><i className={`bi ${isDoctor ? 'bi-clipboard-pulse' : 'bi-clipboard-plus'} me-2`} />{isDoctor ? 'Lihat pemeriksaan' : 'Daftarkan kunjungan'}</Link></div>
        <div className="daily-progress"><span>Pelayanan hari ini</span><strong>{stats ? `${progress}%` : '—'}</strong><div className="progress" role="progressbar" aria-label="Kunjungan selesai" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="progress-bar" style={{ width: `${progress}%` }} /></div><p>{stats ? `${stats.completedPatients} dari ${stats.totalQueuesToday} kunjungan selesai` : 'Menunggu ringkasan pelayanan'}</p></div>
      </section>
      {error ? <ErrorState message={error} onRetry={() => setRevision(value => value + 1)} /> : !data ? <LoadingSpinner /> : <>
        <div className="section-heading"><h3>Ringkasan hari ini</h3><Button variant="link" onClick={() => setRevision(value => value + 1)}><i className="bi bi-arrow-clockwise me-2" />Perbarui</Button></div>
        <Row className="g-3 mb-4">
          {[
            ['Pasien hari ini', stats.patientsToday, 'bi-person-heart', 'primary'],
            ['Menunggu giliran', stats.waitingPatients, 'bi-clock', 'warning'],
            ['Kunjungan selesai', stats.completedPatients, 'bi-check2-circle', 'info'],
            ['Pasien terdaftar', stats.totalPatients, 'bi-people', 'secondary'],
          ].map(([title, value, icon, color]) => <Col sm={6} xl={3} key={title}><StatCard title={title} value={value} icon={icon} color={color} /></Col>)}
        </Row>
        <div className="dashboard-grid"><section className="work-panel"><div className="section-heading"><div><h3>Antrean pelayanan</h3><p>Kunjungan yang masih aktif hari ini.</p></div><Link to={isDoctor ? '/examinations' : '/queue'}>Lihat semua</Link></div>
          {active.length ? <Table responsive hover><thead><tr><th>Antrean</th><th>Pasien</th><th>Tujuan poli</th><th>Status</th><th></th></tr></thead><tbody>{active.slice(0, 5).map(queue => <tr key={queue.id}><td><span className="queue-ticket">{queue.queue_number}</span></td><td><strong>{queue.patient?.name}</strong><small className="d-block text-muted">{queue.patient?.medical_record_number}</small></td><td>{queue.clinic?.clinic_name}</td><td><StatusBadge status={queue.status} /></td><td><Link className="btn btn-sm btn-outline-primary" to={`/patients/detail/${queue.patient_id}`}>Detail</Link></td></tr>)}</tbody></Table> : <EmptyState message="Belum ada antrean aktif hari ini." icon="bi-calendar-check" />}
        </section><aside className="work-panel quick-panel"><h3>Akses cepat</h3><p>Lanjutkan pekerjaan Anda.</p>{(isDoctor ? [
          ['/examinations', 'bi-clipboard-pulse', 'Pemeriksaan pasien', 'Lengkapi SOAP dan resep'],
          ['/history', 'bi-clock-history', 'Riwayat pelayanan', 'Tinjau kunjungan sebelumnya'],
        ] : [
          ['/patients/add', 'bi-person-plus', 'Pasien baru', 'Buat data rekam medis'],
          ['/registrations', 'bi-clipboard-plus', 'Pendaftaran', 'Atur tujuan kunjungan'],
          ['/queue', 'bi-list-ol', 'Kelola antrean', 'Panggil giliran berikutnya'],
        ]).map(([to, icon, title, desc]) => <Link className="quick-link" to={to} key={to}><span><i className={`bi ${icon}`} /></span><div><strong>{title}</strong><small>{desc}</small></div><i className="bi bi-chevron-right" /></Link>)}<div className="clinic-capacity"><span><i className="bi bi-person-badge" /> {stats.totalDoctors} dokter</span><span><i className="bi bi-building" /> {stats.totalClinics} poli</span></div></aside></div>
      </>}
    </div>
  );
};
export default DashboardPage;
