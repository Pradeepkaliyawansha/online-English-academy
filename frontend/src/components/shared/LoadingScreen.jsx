import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
