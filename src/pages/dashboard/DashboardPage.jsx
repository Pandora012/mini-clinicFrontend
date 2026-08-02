import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { dashboardService } from "../../services/dashboard.service";
import { toast } from "react-toastify";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <StatCard title="Total Pasien" value={stats?.totalPatients || 0} icon="bi-people" color="primary" />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Pasien Hari Ini" value={stats?.patientsToday || 0} icon="bi-person-plus" color="success" />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Antrean Hari Ini" value={stats?.totalQueuesToday || 0} icon="bi-list-ol" color="warning" />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Pasien Selesai" value={stats?.completedPatients || 0} icon="bi-check-circle" color="info" />
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6} xl={3}>
          <StatCard title="Menunggu" value={stats?.waitingPatients || 0} icon="bi-clock" color="secondary" />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Total Dokter" value={stats?.totalDoctors || 0} icon="bi-person-badge" color="primary" />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Total Poli" value={stats?.totalClinics || 0} icon="bi-building" color="info" />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
