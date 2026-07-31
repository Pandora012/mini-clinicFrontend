import { NavLink } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants';

const Sidebar = ({ show, handleClose, isDesktop }) => {
  const { user } = useAuth();

  const menuItems = {
    [ROLES.ADMINISTRATOR]: [
      { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
      { path: '/patients', icon: 'bi-people', label: 'Pasien' },
      { path: '/doctors', icon: 'bi-person-badge', label: 'Dokter' },
      { path: '/clinics', icon: 'bi-building', label: 'Poli' },
      { path: '/registrations', icon: 'bi-clipboard-plus', label: 'Pendaftaran' },
      { path: '/queue', icon: 'bi-list-ol', label: 'Antrean' },
      { path: '/examinations', icon: 'bi-clipboard-pulse', label: 'Pemeriksaan' },
    ],
    [ROLES.DOKTER]: [
      { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
      { path: '/examinations', icon: 'bi-clipboard-pulse', label: 'Pemeriksaan' },
      { path: '/history', icon: 'bi-clock-history', label: 'Riwayat' },
    ],
    [ROLES.PETUGAS]: [
      { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
      { path: '/patients', icon: 'bi-people', label: 'Pasien' },
      { path: '/registrations', icon: 'bi-clipboard-plus', label: 'Pendaftaran' },
      { path: '/queue', icon: 'bi-list-ol', label: 'Antrean' },
    ]
  };

  const userMenu = menuItems[user?.role] || [];

  const SidebarContent = () => (
    <div className="h-100 d-flex flex-column bg-white">
      <div className="p-4 border-bottom">
        <h5 className="mb-0 fw-bold text-primary">
          <i className="bi bi-hospital me-2"></i>
          Mini Clinic
        </h5>
      </div>
      <div className="flex-grow-1 overflow-auto py-3">
        {userMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center px-4 py-2 mb-1 ${isActive ? 'active bg-primary text-white' : 'text-dark'}`
            }
            onClick={handleClose}
          >
            <i className={`bi ${item.icon} me-2`}></i>
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="p-3 border-top">
        <button
          className="btn btn-outline-danger w-100"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="sidebar d-none d-lg-block border-end" style={{ width: '250px', minHeight: '100vh' }}>
        <SidebarContent />
      </div>
    );
  }

  return (
    <Offcanvas show={show} onHide={handleClose} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <SidebarContent />
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;