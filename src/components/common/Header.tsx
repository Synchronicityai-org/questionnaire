import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import Auth from '../auth/Auth';
import './Header.css';

interface HeaderProps {
  isAuthenticated: boolean;
  onAuthChange?: (isAuth: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onAuthChange }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [kidProfileId, setKidProfileId] = useState<string | null>(null);
  const [localAuth, setLocalAuth] = useState(isAuthenticated);
  const navigate = useNavigate();
  const client = generateClient<Schema>();

  useEffect(() => {
    setLocalAuth(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    if (localAuth) {
      fetchKidProfileId();
    } else {
      setKidProfileId(null);
      setShowUserMenu(false);
    }
  }, [localAuth]);

  const fetchKidProfileId = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.userId) {
        setKidProfileId(null);
        return;
      }

      const kidProfiles = await client.models.KidProfile.list({
        filter: {
          parentId: {
            eq: currentUser.userId
          }
        }
      });

      if (kidProfiles.data && kidProfiles.data.length > 0 && kidProfiles.data[0].id) {
        setKidProfileId(kidProfiles.data[0].id);
      } else {
        setKidProfileId(null);
      }
    } catch (error) {
      console.error('Error fetching kid profile:', error);
      setKidProfileId(null);
    }
  };

  const handleKidProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (kidProfileId) {
      navigate(`/kid-profile/${kidProfileId}`);
    } else {
      navigate('/kid-profile-form');
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      setShowUserMenu(false);
      setLocalAuth(false);
      if (onAuthChange) {
        onAuthChange(false);
      }
      await signOut({ global: true });
      setKidProfileId(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      setLocalAuth(true);
      if (onAuthChange) {
        onAuthChange(true);
      }
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
          {localAuth && !isSigningOut && kidProfileId && (
            <button onClick={handleKidProfileClick} className="nav-button">
              Kids Profile
            </button>
          )}
          {(!localAuth || isSigningOut) ? (
            <button 
              className="auth-button"
              onClick={() => setIsAuthOpen(true)}
              aria-label="Login"
              disabled={isSigningOut}
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
                  >
                    Sign Out
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