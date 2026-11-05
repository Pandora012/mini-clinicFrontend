import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Table, Card } from 'react-bootstrap';
import { queueService } from '../../services/queue.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
const HistoryPage = () => {
  const [date, setDate] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    queueService.getHistory({ date }).then(response => { if (active) setRows(response.data.data); })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Riwayat belum dapat dimuat.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, revision]);
  return <div><div className="page-heading"><div><p className="page-intro">Catatan pelayanan</p><h2>Riwayat kunjungan</h2><p className="text-muted mb-0">Tinjau pelayanan dan buka rekam medis pasien.</p></div><div><Form.Label htmlFor="history-date">Tanggal kunjungan</Form.Label><Form.Control id="history-date" type="date" value={date} onChange={event => setDate(event.target.value)} /></div></div><Card><Card.Body>{loading ? <LoadingSpinner /> : error ? <ErrorState message={error} onRetry={() => setRevision(value => value + 1)} /> : !rows.length ? <EmptyState message="Belum ada kunjungan pada periode ini." icon="bi-calendar-x" /> : <Table responsive hover><thead><tr><th>Tanggal</th><th>Pasien</th><th>Dokter / poli</th><th>Status</th><th>Rekam medis</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.visit_date}</td><td><strong>{row.patient?.name}</strong><small className="d-block text-muted">{row.patient?.medical_record_number}</small></td><td>{row.doctor?.doctor_name}<small className="d-block text-muted">{row.clinic?.clinic_name}</small></td><td><StatusBadge status={row.status} /></td><td><Link className="btn btn-sm btn-outline-primary" to={`/patients/detail/${row.patient_id}`}>Lihat riwayat</Link></td></tr>)}</tbody></Table>}</Card.Body></Card></div>;
};
export default HistoryPage;
