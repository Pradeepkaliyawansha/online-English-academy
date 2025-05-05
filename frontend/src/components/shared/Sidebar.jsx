import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import {
  FaHome,
  FaUser,
  FaUserGraduate,
  FaClipboardList,
  FaCalendarAlt,
  FaMoneyBill,
  FaUsers,
  FaBook,
} from "react-icons/fa";
import { FcOvertime } from "react-icons/fc";


const Sidebar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();

  // Define role-specific navigation links
  const getNavLinks = () => {
    const { role } = currentUser || { role: "" };

    const links = [
      {
        path: "/dashboard",
        icon: <FaHome />,
        text: "Dashboard",
        roles: [
          "Admin",
          "Lecturer",
          "HR Manager",
          "Exam Manager",
          "Exam Coordinator",
          "Finance Manager",
          "Student",
          "Academic Manager",
        ],
      },
    ];

    // Admin links - Using FaUsers for User Management
    if (role === "Admin") {
      links.push(
        { path: "/users", icon: <FaUsers />, text: "User Management" },
        { path: "/lecturers", icon: <FaUserGraduate />, text: "Lecturers" },
        { path: "/hr", icon: <FaUser />, text: "HR" },
        { path: "/exams", icon: <FaClipboardList />, text: "Exams" },
        { path: "/finance", icon: <FaMoneyBill />, text: "Finance" }
      );
    }

    // Academic Manager links
    if (role === "Academic Manager" || role === "Admin") {
      links.push(
        { path: "/dashboard/courses", icon: <FaBook />, text: "Courses" },
        {
          path: "/dashboard/timetable",
          icon: <FcOvertime />,
          text: "Time Tables",
        }
      );
    }

    // Lecturer links
    if (role === "Lecturer" || role === "Admin") {
      links
        .push
        // { path: '/courses', icon: <FaClipboardList />, text: 'My Courses' },
        // { path: '/students', icon: <FaUserGraduate />, text: 'My Students' }
        ();
    }

    // HR Manager links
    if (role === "HR Manager" || role === "Admin") {
      links
        .push
        // { path: '/staff', icon: <FaUser />, text: 'Staff Management' },
        // { path: '/recruitment', icon: <FaUserGraduate />, text: 'Recruitment' }
        ();
    }

    // Exam Manager links
    if (role === "Exam Manager" || role === "Admin") {
      links
        .push
        // { path: '/exam-schedule', icon: <FaCalendarAlt />, text: 'Exam Schedule' },
        // { path: '/exam-results', icon: <FaClipboardList />, text: 'Results' }
        ();
    }

    // Exam Coordinator links
    if (
      role === "Exam Coordinator" ||
      role === "Exam Manager" ||
      role === "Admin"
    ) {
      links
        .push
        // { path: '/proctoring', icon: <FaClipboardList />, text: 'Proctoring' },
        // { path: '/exam-materials', icon: <FaClipboardList />, text: 'Exam Materials' }
        ();
    }

    // Finance Manager links
    if (role === "Finance Manager" || role === "Admin") {
      links
        .push
        // { path: '/payments', icon: <FaMoneyBill />, text: 'Payments' },
        // { path: '/invoices', icon: <FaMoneyBill />, text: 'Invoices' },
        // { path: '/financial-reports', icon: <FaClipboardList />, text: 'Financial Reports' }
        ();
    }

    return links;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>English Academy</h2>
        <p>
          {currentUser?.name} ({currentUser?.role})
        </p>
      </div>

      <ul className="sidebar-menu">
        {getNavLinks().map((link, index) => {
          // Special case for Dashboard to use exact matching
          const isActive = link.path === '/dashboard' 
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(link.path);
            
          return (
            <li key={index}>
              <NavLink 
                to={link.path} 
                className={isActive ? 'active' : ''}
                end={link.path === '/dashboard'} // Use exact matching for Dashboard
              >
                <span className="icon">{link.icon}</span>
                <span>{link.text}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
