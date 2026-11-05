import { NavLink } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useAuth } from "../../contexts/useAuth";
import { ROLES } from "../../constants";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ show, handleClose, isDesktop }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = {
    [ROLES.ADMINISTRATOR]: [
      { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
      { path: "/patients", icon: "bi-people", label: "Pasien" },
      { path: "/doctors", icon: "bi-person-badge", label: "Dokter" },
      { path: "/clinics", icon: "bi-building", label: "Poli" },
      { path: "/registrations", icon: "bi-clipboard-plus", label: "Pendaftaran" },
      { path: "/queue", icon: "bi-list-ol", label: "Antrean" },
      { path: "/examinations", icon: "bi-clipboard-pulse", label: "Pemeriksaan" },
      { path: "/history", icon: "bi-clock-history", label: "Riwayat" },
    ],
    [ROLES.DOKTER]: [
      { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
      { path: "/examinations", icon: "bi-clipboard-pulse", label: "Pemeriksaan" },
      { path: "/history", icon: "bi-clock-history", label: "Riwayat" },
],
    [ROLES.PETUGAS]: [
      { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
      { path: "/patients", icon: "bi-people", label: "Pasien" },
      { path: "/registrations", icon: "bi-clipboard-plus", label: "Pendaftaran" },
      { path: "/queue", icon: "bi-list-ol", label: "Antrean" },
    ],
  };

  const userMenu = menuItems[user?.role] || [];

  const SidebarContent = () => (
    <div className="sidebar-content h-100 d-flex flex-column bg-white">
      <div className="flex-grow-1 overflow-auto py-3">
        <p className="sidebar-label">Ruang kerja</p>
        {userMenu.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link d-flex align-items-center px-4 py-2 mb-1 ${isActive ? "active bg-primary text-white" : "text-dark"}`} onClick={handleClose}>
            <i className={`bi ${item.icon} me-2`}></i>
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="p-3 border-top">
        <div className="sidebar-note"><i className="bi bi-heart-pulse" /><strong>Pelayanan lebih terarah</strong><span>Kelola kebutuhan klinik dalam satu tempat.</span></div>
        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Keluar
        </button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="sidebar d-none d-lg-block border-end" style={{ width: "250px", minHeight: "100vh" }}>
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
