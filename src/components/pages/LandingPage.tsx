import React, { useState } from 'react';
import Auth from '../auth/Auth';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to Questionnaire</h1>
        <p className="hero-text">
          Connect with your child's care team and track their progress together.
        </p>
        <button 
          className="get-started-button"
          onClick={() => setIsAuthOpen(true)}
        >
          Get Started
        </button>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">👨‍👩‍👧‍👦</div>
          <h3>Family-Centered Care</h3>
          <p>Keep your entire care team connected and informed about your child's progress.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Track Progress</h3>
          <p>Monitor development and celebrate milestones with easy-to-use tools.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Team Collaboration</h3>
          <p>Seamlessly communicate with caregivers, therapists, and healthcare providers.</p>
        </div>
      </div>

      <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default LandingPage; 