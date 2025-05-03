import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../auth/Auth';
import './LandingPage.css';
import teamCollaboration from '../../assets/images/teamCollobaration.png';
import progressTracking from '../../assets/images/progressTracking.jpeg';
import securedCommunication from '../../assets/images/secureCommunication.jpeg';

const LandingPage: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <section className="hero relative z-10">
        <h1>Welcome to TinyWins.AI</h1>
        <p>For the parents, by the parents</p>
        <div className="flex gap-4 justify-center mt-8 relative z-20 ml-16">
          <button 
            className="px-10 py-5 bg-green-600 text-white text-2xl rounded-lg hover:bg-green-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md font-bold"
            onClick={() => navigate('/contact')}
          >
            Join the Movement
          </button>
          <button 
            className="px-10 py-5 bg-blue-600 text-white text-2xl rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md font-bold"
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