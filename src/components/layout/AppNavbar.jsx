import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';
import { useAuth } from '../../contexts/AuthContext';

const AppNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="white" className="border-bottom px-3 sticky-top" style={{ zIndex: 1030 }}>
      <Container fluid>
        <div className="d-flex align-items-center">
          <button className="btn btn-link text-dark me-3 d-lg-none" onClick={toggleSidebar}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <Navbar.Brand href="/dashboard" className="fw-bold text-primary">
            <i className="bi bi-hospital me-2"></i>
            Mini Clinic
          </Navbar.Brand>
        </div>

        <div className="d-flex align-items-center">
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-circle"></i>
              <span className="d-none d-md-inline">{user?.name || 'User'}</span>
              <Badge bg="primary" className="ms-1">{user?.role || 'Staff'}</Badge>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;