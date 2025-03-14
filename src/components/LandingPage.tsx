import { Link } from 'react-router-dom';
import './LandingPage.css';

interface LandingPageProps {
  onDemoClick: () => void;
}

export function LandingPage({ onDemoClick }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to Synchronicity AI</h1>
        <p className="subtitle">Empowering families through collaborative care and intelligent support</p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">
            Get Started
          </Link>
          <button onClick={onDemoClick} className="cta-button secondary">
            Try Demo
          </button>
        </div>
      </div>
      <div className="features-section">
        <h2>Why Choose Synchronicity AI?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Collaborative Care</h3>
            <p>Connect with healthcare providers, caregivers, and specialists in one place</p>
          </div>
          <div className="feature-card">
            <h3>Smart Tracking</h3>
            <p>Monitor progress and milestones with AI-powered insights</p>
          </div>
          <div className="feature-card">
            <h3>Secure Platform</h3>
            <p>Your family's data is protected with enterprise-grade security</p>
          </div>
        </div>
      </div>
    </div>
  );
} 