import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

const AppNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  return (
    <Navbar bg="white" className="clinic-navbar border-bottom sticky-top">
      <Container fluid>
        <div className="d-flex align-items-center">
          <button className="btn btn-light me-2 d-lg-none" onClick={toggleSidebar} aria-label="Buka menu navigasi"><i className="bi bi-list fs-4" /></button>
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary m-0"><span className="brand-mark"><i className="bi bi-heart-pulse" /></span>Mini Clinic</Navbar.Brand>
          <span className="navbar-caption">Sistem informasi klinik</span>
        </div>
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2">
            <span className="user-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <span className="d-none d-md-block text-start"><strong className="d-block small">{user?.name || 'Pengguna'}</strong><small className="text-muted">{user?.role || 'Staf'}</small></span>
          </Dropdown.Toggle>
          <Dropdown.Menu><Dropdown.Item onClick={logout}><i className="bi bi-box-arrow-right me-2" />Keluar</Dropdown.Item></Dropdown.Menu>
        </Dropdown>
      </Container>
    </Navbar>
  );
};
export default AppNavbar;
