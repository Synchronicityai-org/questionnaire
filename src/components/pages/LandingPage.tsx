import React from 'react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Welcome to SynchronicityAI</h1>
        <p>Empowering care teams through collaborative support</p>
      </section>
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Team Collaboration</h3>
            <p>Work together seamlessly with care providers and family members</p>
          </div>
          <div className="feature-card">
            <h3>Progress Tracking</h3>
            <p>Monitor and track development milestones effectively</p>
          </div>
          <div className="feature-card">
            <h3>Secure Communication</h3>
            <p>Share updates and information safely with team members</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 