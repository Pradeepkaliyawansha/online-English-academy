import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Fluent Future Academy</h3>
          <p>Empowering students with quality English education since 2010</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/courses-catalog">Courses</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact Info</h3>
          <address>
            <p><FaMapMarkerAlt /> 123 Education St, Learning City</p>
            <p><FaEnvelope /> info@englishacademy.com</p>
            <p><FaPhone /> +1 234 567 8900</p>
          </address>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} Online English Academy. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default PublicFooter;
