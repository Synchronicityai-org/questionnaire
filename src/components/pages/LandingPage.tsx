import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../auth/Auth';
import './LandingPage.css';
import teamCollaboration from '../../assets/images/teamCollboration.png';
import progressTracking from '../../assets/images/progresstracking.png';
import securedCommunication from '../../assets/images/securedCommunication.png';

const LandingPage: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <section className="hero relative z-10">
        <h1>Welcome to SynchronicityAI</h1>
        <p>Empowering care teams through collaborative support</p>
        <div className="flex gap-4 justify-center mt-8 relative z-20 ml-16">
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            onClick={() => navigate('/demo')}
          >
            Try Demo
          </button>
          <button 
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={() => setIsAuthOpen(true)}
          >
            Sign In
          </button>
        </div>
      </section>
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <img src={teamCollaboration} alt="Team Collaboration" />
            <h3>Team Collaboration</h3>
            <p>Work together seamlessly with care providers and family members</p>
          </div>
          <div className="feature-card">
            <img src={progressTracking} alt="Progress Tracking" />
            <h3>Progress Tracking</h3>
            <p>Monitor and track development milestones effectively</p>
          </div>
          <div className="feature-card">
            <img src={securedCommunication} alt="Secure Communication" />
            <h3>Secure Communication</h3>
            <p>Share updates and information safely with team members</p>
          </div>
        </div>
      </section>
      <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default LandingPage; 