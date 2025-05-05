import { useState, useEffect } from 'react';
import Header from '../shared/Header';
import { FaClipboardCheck, FaCalendarAlt, FaUserGraduate, FaFileAlt } from 'react-icons/fa';

const ExamManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalExams: 0,
    upcomingExams: 0,
    totalCandidates: 0,
    pendingResults: 0
  });
  
  const [examSchedule, setExamSchedule] = useState([]);

  // In a real app, you would fetch actual data here
  useEffect(() => {
    // Simulate fetching data
    setStats({
      totalExams: 32,
      upcomingExams: 8,
      totalCandidates: 256,
      pendingResults: 64
    });
    
    setExamSchedule([
      { id: 1, exam: 'IELTS General', date: '2023-12-05', time: '09:00 AM', venue: 'Hall A', candidates: 45 },
      { id: 2, exam: 'TOEFL', date: '2023-12-07', time: '10:30 AM', venue: 'Hall B', candidates: 38 },
      { id: 3, exam: 'Business English Certificate', date: '2023-12-10', time: '01:00 PM', venue: 'Hall C', candidates: 22 },
      { id: 4, exam: 'IELTS Academic', date: '2023-12-12', time: '09:00 AM', venue: 'Hall A', candidates: 50 }
    ]);
  }, []);

  return (
    <>
      <Header title="Exam Manager Dashboard" />
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon"><FaClipboardCheck /></div>
          <div className="stat-details">
            <h3>Total Exams</h3>
            <p>{stats.totalExams}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaCalendarAlt /></div>
          <div className="stat-details">
            <h3>Upcoming Exams</h3>
            <p>{stats.upcomingExams}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaUserGraduate /></div>
          <div className="stat-details">
            <h3>Registered Candidates</h3>
            <p>{stats.totalCandidates}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaFileAlt /></div>
          <div className="stat-details">
            <h3>Pending Results</h3>
            <p>{stats.pendingResults}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Upcoming Exam Schedule</h3>
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Candidates</th>
              </tr>
            </thead>
            <tbody>
              {examSchedule.map(schedule => (
                <tr key={schedule.id}>
                  <td>{schedule.exam}</td>
                  <td>{schedule.date}</td>
                  <td>{schedule.time}</td>
                  <td>{schedule.venue}</td>
                  <td>{schedule.candidates}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="/exam-schedule" className="view-all">View Full Schedule</a>
        </div>
        
        <div className="dashboard-card">
          <h3>Recent Activities</h3>
          <ul className="activity-list">
            <li>
              <div className="activity-time">Today, 09:45 AM</div>
              <div className="activity-details">
                <span className="activity-user">System</span>
                <span className="activity-action">Exam registration closed for IELTS General (Dec 5)</span>
              </div>
            </li>
            <li>
              <div className="activity-time">Yesterday, 03:22 PM</div>
              <div className="activity-details">
                <span className="activity-user">Jane Smith</span>
                <span className="activity-action">Uploaded TOEFL results (Nov 20 batch)</span>
              </div>
            </li>
            <li>
              <div className="activity-time">Yesterday, 10:15 AM</div>
              <div className="activity-details">
                <span className="activity-user">Admin</span>
                <span className="activity-action">Added new exam: Business English Certificate (Dec 10)</span>
              </div>
            </li>
          </ul>
          <a href="/activities" className="view-all">View All Activities</a>
        </div>
      </div>
    </>
  );
};

export default ExamManagerDashboard;
