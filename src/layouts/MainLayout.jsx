import { useState } from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import AppNavbar from '../components/layout/AppNavbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
const labels = { dashboard: 'Dashboard', patients: 'Pasien', doctors: 'Dokter', clinics: 'Poli', registrations: 'Pendaftaran', queue: 'Antrean', examinations: 'Pemeriksaan', history: 'Riwayat', add: 'Tambah pasien', edit: 'Edit pasien', detail: 'Detail pasien' };
const MainLayout = () => {
  const [sidebarShow, setSidebarShow] = useState(false);
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const section = segments[0];
  const current = segments.length > 1 ? labels[segments[1]] || 'Detail pemeriksaan' : labels[section] || 'Halaman';
  return <div className="clinic-app d-flex flex-column min-vh-100"><a className="skip-link" href="#main-content">Langsung ke konten</a><AppNavbar toggleSidebar={() => setSidebarShow(value => !value)} /><div className="d-flex flex-grow-1"><Sidebar show={sidebarShow} handleClose={() => setSidebarShow(false)} isDesktop /><Sidebar show={sidebarShow} handleClose={() => setSidebarShow(false)} isDesktop={false} /><main id="main-content" className="clinic-main flex-grow-1" tabIndex={-1}><div className="container-fluid page-content"><Breadcrumb className="mb-4"><Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>Mini Clinic</Breadcrumb.Item><Breadcrumb.Item active>{current}</Breadcrumb.Item></Breadcrumb><Outlet /></div><footer className="app-footer"><span>Mini Clinic</span><span>Ruang kerja pelayanan pasien</span></footer></main></div></div>;
};
export default MainLayout;
