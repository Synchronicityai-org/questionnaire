import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCog, faUserCircle, faChartLine, faClipboardList, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Header.css';

export function Header() {
  // TODO: Replace with actual auth check
  const isLoggedIn = true;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="app-title">TinyWins.AI</Link>
        </div>
        <button 
          className={`burger-menu ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={`header-right ${isMenuOpen ? 'active' : ''}`}>
          {isLoggedIn && (
            <>
              <Link to="/milestones" className="icon-button" aria-label="Milestones" onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faChartLine} />
                <span>Milestones</span>
              </Link>
              <Link to="/assessments" className="icon-button" aria-label="Assessments" onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faClipboardList} />
                <span>Assessments</span>
              </Link>
              <Link to="/team" className="icon-button" aria-label="Team" onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faUsers} />
                <span>Team</span>
              </Link>
              <button className="icon-button" aria-label="Notifications" onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faBell} />
              </button>
              <button className="icon-button" aria-label="Settings" onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faCog} />
              </button>
              <button className="profile-button" aria-label="Account" onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faUserCircle} />
              </button>
            </>
          )}
        </div>
      </header>
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
} 