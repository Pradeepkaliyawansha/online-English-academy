import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import LecturerDashboard from './dashboards/LecturerDashboard';
import HRManagerDashboard from './dashboards/HRManagerDashboard';
import ExamManagerDashboard from './dashboards/ExamManagerDashboard';
import ExamCoordinatorDashboard from './dashboards/ExamCoordinatorDashboard';
import FinanceManagerDashboard from './dashboards/FinanceManagerDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import AcademicManagerDashboard from './dashboards/AcademicManagerDashboard';

const DashboardRouter = () => {
  const { currentUser } = useContext(AuthContext);

  // Return the appropriate dashboard based on user role
  switch (currentUser?.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Lecturer':
      return <LecturerDashboard />;
    case 'Academic Manager':
      return <AcademicManagerDashboard />;
    case 'HR Manager':
      return <HRManagerDashboard />;
    case 'Exam Manager':
      return <ExamManagerDashboard />;
    case 'Exam Coordinator':
      return <ExamCoordinatorDashboard />;
    case 'Finance Manager':
      return <FinanceManagerDashboard />;
    case 'Student':
      return <StudentDashboard />;
    default:
      // Default fallback for unknown roles
      return (
        <div className="dashboard-placeholder">
          <h2>Dashboard</h2>
          <p>Welcome to Fluent Future</p>
          <p>Please contact an administrator if you need help accessing your dashboard</p>
        </div>
      );
  }
};

export default DashboardRouter;
