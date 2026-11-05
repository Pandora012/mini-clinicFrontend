// Router definitions own lazy page imports; this module intentionally exports a router.
/* eslint-disable react/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Link } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROLES } from '../constants';
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const PatientsPage = lazy(() => import('../pages/patients/PatientsPage'));
const PatientFormPage = lazy(() => import('../pages/patients/PatientFormPage'));
const PatientDetailPage = lazy(() => import('../pages/patients/PatientDetailPage'));
const DoctorsPage = lazy(() => import('../pages/doctors/DoctorsPage'));
const ClinicsPage = lazy(() => import('../pages/clinics/ClinicsPage'));
const RegistrationsPage = lazy(() => import('../pages/registrations/RegistrationsPage'));
const QueuePage = lazy(() => import('../pages/queue/QueuePage'));
const ExaminationPage = lazy(() => import('../pages/examinations/ExaminationPage'));
const ExaminationAll = lazy(() => import('../pages/examinations/ExaminationAll'));
const HistoryPage = lazy(() => import('../pages/examinations/HistoryPage'));
const view = (Page, roles = []) => <ProtectedRoute allowedRoles={roles}><Suspense fallback={<LoadingSpinner />}><Page /></Suspense></ProtectedRoute>;
const staff = [ROLES.ADMINISTRATOR, ROLES.PETUGAS];
const clinical = [ROLES.ADMINISTRATOR, ROLES.DOKTER];
const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={<LoadingSpinner />}><LoginPage /></Suspense> },
  { path: '/', element: <ProtectedRoute><MainLayout /></ProtectedRoute>, children: [
    { index: true, element: <Navigate to="/dashboard" replace /> },
    { path: 'dashboard', element: view(DashboardPage) },
    { path: 'patients', element: view(PatientsPage, staff) },
    { path: 'patients/add', element: view(PatientFormPage, staff) },
    { path: 'patients/edit/:id', element: view(PatientFormPage, staff) },
    { path: 'patients/detail/:id', element: view(PatientDetailPage) },
    { path: 'doctors', element: view(DoctorsPage, [ROLES.ADMINISTRATOR]) },
    { path: 'clinics', element: view(ClinicsPage, [ROLES.ADMINISTRATOR]) },
    { path: 'registrations', element: view(RegistrationsPage, staff) },
    { path: 'queue', element: view(QueuePage, staff) },
    { path: 'examinations/:id', element: view(ExaminationPage, clinical) },
    { path: 'examinations', element: view(ExaminationAll, clinical) },
    { path: 'history', element: view(HistoryPage, clinical) },
    { path: '*', element: <div className="empty-panel"><i className="bi bi-signpost-split" /><h2>Halaman tidak ditemukan</h2><p>Gunakan menu untuk menuju layanan yang Anda butuhkan.</p><Link className="btn btn-primary" to="/dashboard">Kembali ke dashboard</Link></div> },
  ] },
]);
export default router;
