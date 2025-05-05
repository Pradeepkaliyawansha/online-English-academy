import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <h2 className="profile-title">My Profile</h2>
        
        <div className="profile-field">
          <label>Full Name</label>
          <div className="field-value">KUMODYA THAMADI RUPASINGHE</div>
        </div>

        <div className="profile-field">
          <label>Phone Number</label>
          <div className="field-value">0771254120</div>
        </div>

        <div className="profile-field">
          <label>NIC</label>
          <div className="field-value">200381800489</div>
        </div>

        <div className="profile-field">
          <label>Birthday</label>
          <div className="field-value">2008-06-26</div>
        </div>

        <div className="profile-field">
          <label>Gender</label>
          <div className="field-value">Female</div>
        </div>

        <button className="edit-profile-btn">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile; 