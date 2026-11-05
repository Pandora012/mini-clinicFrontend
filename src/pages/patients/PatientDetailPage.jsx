import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Accordion, Table } from 'react-bootstrap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { patientService } from '../../services/patient.service';
import { examinationService } from '../../services/examination.service';
import { queueService } from '../../services/queue.service';
import dayjs from 'dayjs';

const PatientDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null); setError('');
    Promise.all([patientService.getById(id), examinationService.getPatientHistory(id), queueService.getHistory({ patient_id: id })])
      .then(([patient, examinations, visits]) => { if (active) setData({ patient: patient.data.data, examinations: examinations.data.data, visits: visits.data.data }); })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Data pasien belum dapat dimuat.'); });
    return () => { active = false; };
  }, [id, revision]);
  if (error) return <ErrorState message={error} onRetry={() => setRevision(value => value + 1)} />;
  if (!data) return <LoadingSpinner />;
  const { patient, visits, examinations } = data;
  const examsByVisit = new Map(examinations.map(exam => [exam.registration_id, exam]));
  return <div>
    <div className="page-heading"><div><p className="page-intro">Rekam medis pasien</p><h2>{patient.name}</h2><p className="text-muted mb-0">{patient.medical_record_number}</p></div><Link to="/dashboard" className="btn btn-outline-primary"><i className="bi bi-arrow-left me-2" />Dashboard</Link></div>
    <Row className="g-4 mb-4"><Col lg={4}><Card className="h-100"><Card.Body><div className="patient-avatar"><i className="bi bi-person" /></div><h3 className="h5 mb-4">Informasi pasien</h3><dl className="patient-facts">{[['NIK', patient.nik], ['Jenis kelamin', patient.gender], ['Tanggal lahir', dayjs(patient.birth_date).format('DD/MM/YYYY')], ['Telepon', patient.phone || 'Belum dicatat'], ['Alamat', patient.address || 'Belum dicatat']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></Card.Body></Card></Col>
    <Col lg={8}><section className="work-panel"><div className="section-heading"><div><h3>Riwayat kunjungan</h3><p>Pendaftaran, hasil pemeriksaan, dan resep pasien.</p></div><span className="count-pill">{visits.length} kunjungan</span></div>
      {visits.length === 0 ? <EmptyState message="Pasien belum memiliki riwayat kunjungan." icon="bi-calendar-x" /> : <Accordion>{visits.map(visit => {
        const exam = examsByVisit.get(visit.id);
        return <Accordion.Item eventKey={String(visit.id)} key={visit.id}><Accordion.Header><div className="visit-title"><strong>{dayjs(visit.visit_date).format('DD/MM/YYYY')}</strong><span>{visit.clinic?.clinic_name} · {visit.doctor?.doctor_name}</span><StatusBadge status={visit.status} /></div></Accordion.Header><Accordion.Body>
          <p className="text-muted">Antrean {visit.queue_number} · {visit.payment_type}</p>
          {exam ? <><dl className="patient-facts">{[['Keluhan', exam.complaint], ['Diagnosis', exam.diagnosis], ['Rencana terapi', exam.therapy_plan], ['Tekanan darah', exam.blood_pressure], ['Suhu tubuh', exam.body_temperature ? `${exam.body_temperature} °C` : null], ['Berat / tinggi', `${exam.body_weight ?? '—'} kg / ${exam.body_height ?? '—'} cm`]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="preserve-lines">{value || 'Belum dicatat'}</dd></div>)}</dl>
          {exam.medical_actions.length > 0 ? <><h4 className="h6 mt-4">Tindakan medis</h4><ul>{exam.medical_actions.map(action => <li key={action.id}>{action.action_name}{action.notes ? ` — ${action.notes}` : ''}</li>)}</ul></> : null}
          {exam.prescriptions.length > 0 ? <><h4 className="h6 mt-4">Resep obat</h4><Table responsive><thead><tr><th>Obat</th><th>Dosis</th><th>Aturan pakai</th></tr></thead><tbody>{exam.prescriptions.map(rx => <tr key={rx.id}><td>{rx.medicine_name}</td><td>{rx.dosage}</td><td>{rx.instruction}</td></tr>)}</tbody></Table></> : null}</> : <p>Hasil pemeriksaan belum tersedia. Keluhan awal: {visit.initial_complaint || 'Belum dicatat'}.</p>}
        </Accordion.Body></Accordion.Item>;
      })}</Accordion>}
    </section></Col></Row>
  </div>;
};
export default PatientDetailPage;
