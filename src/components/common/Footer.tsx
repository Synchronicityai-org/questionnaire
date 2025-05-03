import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About TinyWins.AI</h3>
          <p>Empowering families and caregivers to work together for better outcomes.</p>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: support@tinywins.ai</p>
          <p>Phone: (555) 123-4567</p>
        </div>
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TinyWins.AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 