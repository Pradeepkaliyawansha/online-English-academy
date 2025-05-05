import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="public-header">
    <div className="header-container">
      <div className="logo" style={{ display: "flex", alignItems: "center" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="public/icons/logo.png"
            alt="logo"
            height="60"
            width="60"
            style={{ marginRight: "10px" }}
          />
          <h1 style={{ color: "#000" }}>Fluent Future Academy</h1>
        </Link>
      </div>
    

        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`main-nav ${mobileMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/courses-catalog"
                className={
                  location.pathname === "/courses-catalog" ? "active" : ""
                }
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={location.pathname === "/about" ? "active" : ""}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={location.pathname === "/contact" ? "active" : ""}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="auth-buttons">
          <Link to="/login" className="btn-login">
            Login
          </Link>
          <Link to="/register" className="btn-register">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
