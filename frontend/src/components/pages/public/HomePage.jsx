import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaGlobe,
  FaAward,
  FaBook,
} from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = "http://localhost:5555/api";

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        // Use the correct endpoint for featured courses
        const response = await axios.get(
          `${API_BASE_URL}/courses/public/featured`
        );
        setFeaturedCourses(response.data);
      } catch (error) {
        console.error("Error fetching featured courses:", error.message);
        setFeaturedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Unlock Your Potential with Quality English Education</h1>
          <p>
            Join thousands of students from around the world learning English
            with expert teachers
          </p>
          <div className="hero-buttons">
            <Link to="/courses-catalog" className="btn-secondary">
              Explore Courses
            </Link>
            <Link to="/register" className="btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/*<div className="hero2">
        <img src="../images/jkjk.jpg" alt="girl" width="100%" />
      </div>*/}

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-container">
          <div className="welcome-left">
            <h2>Welcome to</h2>
            <h1>
              <b>FLUENT FUTURE ACADEMY</b>
            </h1>
            <div className="welcome-underline"></div>
          </div>
          <div className="welcome-right">
            <h3>Shaping Lives, Creating Futures</h3>
            <p>
              Welcome to FLUENT FUTURE ACADEMY — Your Trusted Destination for
              English Language Learning Excellence! Established to help students
              confidently communicate in English and achieve their personal,
              academic, and professional goals, we have proudly guided countless
              learners on their journey to language mastery. At FLUENT FUTURE
              ACADEMY, we specialize in offering a diverse range of English
              programs including General English, Spoken English, IELTS & TOEFL
              preparation, Business English, and Young Learners’ courses. Our
              dedicated team of qualified teachers, engaging classroom
              experiences, and personalized learning support ensure that every
              student thrives in a motivating and friendly environment. Whether
              you're looking to improve your conversation skills, prepare for
              international exams, or enhance your career prospects — we’re here
              to help you succeed. Join us on this exciting journey where
              language unlocks new opportunities and builds brighter futures!{" "}
            </p>
            <Link
              to="/about"
              className="btn-primary2"
              style={{ marginTop: "20px", display: "inline-block" }}
            >
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Vision and Mission Section */}
      <section className="vision-mission-section">
        <div className="vision-mission-container">
          <div className="vision-mission-card">
            <div className="icon-bg">
              <FaBook size={48} color="#fff" />
            </div>
            <h3 className="vision-mission-title">OUR VISION</h3>
            <p className="vision-mission-text">
              To empower learners of all ages and backgrounds to confidently
              communicate in English, unlocking new opportunities in education,
              careers, and global connection. We envision a world where language
              is never a barrier but a bridge — helping individuals grow,
              express, and succeed in every aspect of life.{" "}
            </p>
          </div>
          <div className="vision-mission-card">
            <div className="icon-bg">
              <FaAward size={48} color="#fff" />
            </div>
            <h3 className="vision-mission-title">OUR MISSION</h3>
            <p className="vision-mission-text">
              To provide a dynamic, engaging, and supportive learning
              environment where students can develop strong English language
              skills through expert instruction, innovative teaching methods,
              and personalized attention. Our mission is to nurture confident,
              capable communicators prepared to thrive in a global society.{" "}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-title">
          <h2>Why Choose Us</h2>
        </div>
        <div className="features-container">
          <div className="feature-card">
            <FaChalkboardTeacher className="feature-icon" />
            <h3>Expert and Certified Instructors</h3>
            <p>
              Learn from our team of experienced and certified English teachers
              dedicated to your success.
            </p>
          </div>
          <div className="feature-card">
            <FaUserGraduate className="feature-icon" />
            <h3>Proven Results</h3>
            <p>
              Our students consistently achieve their English language goals,
              with many reporting significant improvements in fluency and
              confidence.
            </p>
          </div>
          <div className="feature-card">
            <FaGlobe className="feature-icon" />
            <h3>Personalized Learning Paths</h3>
            <p>
              We tailor our lessons and resources to match your individual
              learning style and goals.
            </p>
          </div>
          <div className="feature-card">
            <FaAward className="feature-icon" />
            <h3>Accredited Courses</h3>
            <p>Internationally recognized certificates and qualifications</p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-courses">
        <div className="section-title">
          <h2>Featured Courses</h2>
          <p>Find the perfect course to achieve your language goals</p>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : featuredCourses.length > 0 ? (
          <div className="courses-grid">
            {featuredCourses.map((course) => (
              <div className="course-card" key={course._id || course.id}>
                <img
                  src={course.image || "/images/banner.png"} // fallback if no image
                  alt={course.name}
                  className="course-image"
                />
                <div className="course-info">
                  <h3>{course.name}</h3>
                  <div className="course-meta">
                    <span>{course.duration}</span>
                    <span className="course-price">{course.price}</span>
                  </div>
                </div>
                <Link
                  to={`/course/${course._id || course.id}`}
                  className="btn-course"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data-message">
            <p>No featured courses available at the moment.</p>
          </div>
        )}

        <div className="view-all-container">
          <Link to="/courses-catalog" className="btn-view-all">
            View All Courses
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-title2">
          <center>
            <h2>What Our Students Say</h2>
          </center>
        </div>

        <div className="testimonials-container2">
          <div className="testimonial-card2">
            <p>
              "The IELTS preparation course helped me achieve a band score of
              7.5. The instructors were amazing!"
            </p>
            <div className="student-info2">
              <strong>Maria S.</strong>
              <span>IELTS Student</span>
            </div>
          </div>

          <div className="testimonial-card2">
            <p>
              "Business English course improved my confidence in meetings and
              presentations with international clients."
            </p>
            <div className="student-info2">
              <strong>David L.</strong>
              <span>Business Professional</span>
            </div>
          </div>

          <div className="testimonial-card2">
            <p>
              "The flexible online classes fit perfectly with my busy schedule.
              Highly recommend!"
            </p>
            <div className="student-info2">
              <strong>Sarah T.</strong>
              <span>Working Student</span>
            </div>
          </div>

          <div className="testimonial-card2">
            <p>
              "Business English course improved my confidence in meetings and
              presentations with international clients."
            </p>
            <div className="student-info2">
              <strong>David L.</strong>
              <span>Business Professional</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Ready to Start Your English Journey?</h2>
        <p>
          Join thousands of successful students and take your English skills to
          the next level
        </p>
        <Link to="/register" className="btn-primary2">
          Register Now
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
