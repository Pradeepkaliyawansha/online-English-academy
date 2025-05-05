import React from 'react';
import { FaUser, FaPhone, FaIdCard, FaBirthdayCake, FaVenusMars, FaPencilAlt } from 'react-icons/fa';
import '../../styles/StudentProfile.css';

const StudentProfile = ({ studentInfo, onEditClick }) => {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1><FaUser className="header-icon" /> My Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-field">
          <label>
            <FaUser className="field-icon" />
            Full Name
          </label>
          <div className="field-value">{studentInfo.firstName} {studentInfo.lastName}</div>
        </div>

        <div className="profile-field">
          <label>
            <FaPhone className="field-icon" />
            Phone Number
          </label>
          <div className="field-value">{studentInfo.phoneNumber}</div>
        </div>

        <div className="profile-field">
          <label>
            <FaIdCard className="field-icon" />
            NIC
          </label>
          <div className="field-value">{studentInfo.nic}</div>
        </div>

        <div className="profile-field">
          <label>
            <FaBirthdayCake className="field-icon" />
            Birthday
          </label>
          <div className="field-value">{studentInfo.birthday}</div>
        </div>

        <div className="profile-field">
          <label>
            <FaVenusMars className="field-icon" />
            Gender
          </label>
          <div className="field-value">{studentInfo.gender}</div>
        </div>
      </div>

      <button className="edit-profile-btn" onClick={onEditClick}>
        <FaPencilAlt className="btn-icon" /> Edit Profile
      </button>
    </div>
  );
};

export default StudentProfile; 