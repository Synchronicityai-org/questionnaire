import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import Auth from '../auth/Auth';
import './Header.css';

interface HeaderProps {
  isAuthenticated: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      setIsSigningOut(true);
      await signOut({ global: true });
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <svg 
            className="logo-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="logo-text">SynchronicityAI</span>
        </Link>
        <nav className="nav-links">
          {!isAuthenticated ? (
            <button 
              className="auth-button"
              onClick={() => setIsAuthOpen(true)}
              aria-label="Login"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="person-icon"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          ) : (
            <div className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="person-icon"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              {showUserMenu && (
                <div className="user-menu">
                  <Link to="/team-list" className="menu-item" onClick={() => setShowUserMenu(false)}>My Teams</Link>
                  <button 
                    onClick={handleSignOut} 
                    className="menu-item sign-out-button"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
      <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};

export default Header; 