import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import PatientsPage from "../pages/patients/PatientsPage";
import PatientFormPage from "../pages/patients/PatientFormPage";
import PatientDetailPage from "../pages/patients/PatientDetailPage";
import DoctorsPage from "../pages/doctors/DoctorsPage";
import ClinicsPage from "../pages/clinics/ClinicsPage";
import RegistrationsPage from "../pages/registrations/RegistrationsPage";
import QueuePage from "../pages/queue/QueuePage";
import ExaminationPage from "../pages/examinations/ExaminationPage";
import ExaminationAll from "../pages/examinations/ExaminationAll";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "patients",
        element: <PatientsPage />,
      },
      {
        path: "patients/add",
        element: <PatientFormPage />,
      },
      {
        path: "patients/edit/:id",
        element: <PatientFormPage />,
      },
      {
        path: "patients/detail/:id",
        element: <PatientDetailPage />,
      },
      {
        path: "doctors",
        element: <DoctorsPage />,
      },
      {
        path: "clinics",
        element: <ClinicsPage />,
      },
      {
        path: "registrations",
        element: <RegistrationsPage />,
      },
      {
        path: "queue",
        element: <QueuePage />,
      },
      {
        path: "examinations/:id",
        element: <ExaminationPage />,
      },
      {
        path: "examinations",
        element: <ExaminationAll />,
      },
    ],
  },
]);

export default router;
