import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // In a real application, you'd send this data to your backend API
      // await axios.post('http://localhost:5555/api/contact', formData);
      
      // For now, we'll just simulate a successful submission after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Failed to send your message. Please try again.');
      console.error('Contact form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

 
  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you. Get in touch with our team.</p>
      </div>
      
      <div className="contact-container">
        <div className="contact-info">
          <h2>Contact Us</h2>
          <p>Have questions about our courses or need assistance? Our team is here to help you.</p>
          
          <div className="contact-details">
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <h3>Our Location</h3>
                <p>123 Education St, Learning City, 10001</p>
              </div>
            </div>
            
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <div>
                <h3>Phone Number</h3>
                <p>+1 234 567 8900</p>
              </div>
            </div>
            
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <h3>Email Address</h3>
                <p>info@englishacademy.com</p>
              </div>
            </div>
            
            <div className="contact-item">
              <FaClock className="contact-icon" />
              <div>
                <h3>Office Hours</h3>
                <p>Monday-Friday: 9am to 5pm</p>
              </div>
            </div>
          </div>
          
          <div className="social-media">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
              <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M19.8 3H4.2C3.54 3 3 3.54 3 4.2v15.6c0 .66.54 1.2 1.2 1.2h15.6c.66 0 1.2-.54 1.2-1.2V4.2c0-.66-.54-1.2-1.2-1.2zM8.4 18.6H5.7v-8.1h2.7v8.1zM7.05 9.555c-.855 0-1.575-.675-1.575-1.575s.72-1.575 1.575-1.575c.855 0 1.575.675 1.575 1.575s-.675 1.575-1.575 1.575zM18.6 18.6h-2.7v-4.32c0-1.035-.375-1.725-1.335-1.725-.78 0-1.26.585-1.485 1.14-.075.18-.06.435-.06.69v4.215H10.2v-8.1h2.7v1.14c.39-.54 1.035-1.305 2.49-1.305 1.83 0 3.21 1.2 3.21 3.78v4.485z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="contact-form-container">
          <h2>Send Us a Message</h2>
          
          {submitted ? (
            <div className="success-message">
              <h3>Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon.</p>
              <button 
                className="btn-primary"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Your email address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Subject of your message"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your message"
                  rows="5"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="map-container">
        <h2>Our Location</h2>
        <div className="map">
          {/* This would be replaced with an actual map component like Google Maps */}
          <div className="map-placeholder">
            <p>Interactive map would be displayed here</p>
          </div>
        </div>
      </div>
      
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h3>How do I enroll in a course?</h3>
            <p>To enroll in a course, you first need to register for an account. Once registered, you can browse our course catalog and select the course you want to take.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept major credit cards, PayPal, and bank transfers for course payments. All transactions are secure and encrypted.</p>
          </div>
          <div className="faq-item">
            <h3>Can I get a refund if I'm not satisfied?</h3>
            <p>Yes, we offer a 7-day money-back guarantee if you're not satisfied with your course experience.</p>
          </div>
          <div className="faq-item">
            <h3>Who can I contact if I face technical issues?</h3>
            <p>Our support team is available 24/7 via email, chat, and phone. Visit our Contact Us page for details.</p>
          </div>
          <div className="faq-item">
            <h3>Do you offer certificates upon completion?</h3>
            <p>Yes, all our courses come with a certificate of completion that you can download and share with employers or educational institutions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
