import { FaGraduationCap, FaUsers, FaGlobe, FaAward } from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Online English Academy</h1>
        <p>Excellence in English Language Education Since 2010</p>
      </div>

      <section className="about-section">
        <div className="about-content">
          <h2>Our Story</h2>
          <p>
            Founded in 2010, Fluent Future Academy started with a simple
            mission: to make quality English education accessible to students
            worldwide. What began as a small team of passionate educators has
            grown into a global community of learners and teachers united by the
            goal of language mastery.
          </p>
          <p>
            Our journey has been defined by innovation in online learning,
            personalized teaching methods, and a commitment to student success.
            Today, we're proud to have helped over 1000 students from more
            countries improve their English skills and achieve their academic
            and professional goals.
          </p>
        </div>
        <div className="about-image">
          <img src="images/English Academy.png" alt="Academy building" />
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <span className="stat-number">1,000+</span>
          <span className="stat-label">Students</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-number">20+</span>
          <span className="stat-label">Expert Teachers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">98%</span>
          <span className="stat-label">Satisfaction Rate</span>
        </div>
      </section>

      <section className="mission-section">
        <h2>Our Mission & Values</h2>
        <div className="values-container">
          <div className="value-card">
            <FaGraduationCap className="value-icon" />
            <h3>Excellence</h3>
            <p>
              We are committed to the highest standards in curriculum, teaching
              methods, and student support.
            </p>
          </div>
          <div className="value-card">
            <FaUsers className="value-icon" />
            <h3>Inclusivity</h3>
            <p>
              We believe quality education should be accessible to everyone,
              regardless of location or background.
            </p>
          </div>
          <div className="value-card">
            <FaGlobe className="value-icon" />
            <h3>Global Perspective</h3>
            <p>
              We prepare students to communicate effectively in an
              interconnected world.
            </p>
          </div>
          <div className="value-card">
            <FaAward className="value-icon" />
            <h3>Innovation</h3>
            <p>
              We continuously evolve our methods and technology to enhance the
              learning experience.
            </p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Our Leadership Team</h2>
        <div className="team-container">
          <div className="team-member">
            <div className="member-image">
              <img src="/images/manfemale3.jpeg" alt="Team member 1" />
            </div>
            <h3>Thamadi R.A.K</h3>
            <p className="member-role">Admin Manager</p>
            <p>
              Responsible for overseeing day-to-day operations, managing
              schedules, maintaining records, and ensuring smooth communication
              between staff, students, and departments
            </p>
          </div>

          <div className="team-member">
            <div className="member-image">
              <img src="/images/examcoordinator.jpeg" alt="Team member 2" />
            </div>
            <h3>De Silva H.S</h3>
            <p className="member-role">HR Manager</p>
            <p>
              Handles recruitment, staff welfare, training, performance
              management, and ensures a positive, motivating work environment
              for all academy employees.
            </p>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src="/images/girl.jpeg" alt="Team member 3" />
            </div>
            <h3>Jayasinghe I.D.I.R</h3>
            <p className="member-role">Finance Manager</p>
            <p>
              Manages the academy’s financial planning, budgeting, fee
              collections, payroll, and ensures all financial operations are
              accurate, timely, and transparent.
            </p>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src="/images/man2.jpeg" alt="Team member 4" />
            </div>
            <h3>Jayasundara H.H</h3>
            <p className="member-role">Academic Manager</p>
            <p>
              Leads the academic team in designing and updating course
              materials, monitoring teaching standards, supporting teachers, and
              ensuring high-quality education delivery.
            </p>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src="/images/man1.jpeg" alt="Team member 5" />
            </div>
            <h3>De Silva G.K.K</h3>
            <p className="member-role">Exam Co-ordinator</p>
            <p>
              Organizes and supervises all internal and external examinations,
              manages schedules, invigilators, student registrations, and
              ensures fair and transparent assessment processes.
            </p>
          </div>
        </div>
      </section>

      <section className="accreditation-section">
        <h2>Our Accreditations</h2>
        <p>
          Online English Academy is proud to be accredited by leading
          educational organizations, ensuring our courses meet the highest
          standards.
        </p>
        <div className="accreditations">
          <div className="accreditation-logo">
            <img src="/images/OIP2.png" alt="Accreditation 1" />
          </div>
          <div className="accreditation-logo">
            <img src="/images/OIP.jpeg" alt="Accreditation 2" />
          </div>
          <div className="accreditation-logo">
            <img src="/images/OIP (1).jpeg" alt="Accreditation 3" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
