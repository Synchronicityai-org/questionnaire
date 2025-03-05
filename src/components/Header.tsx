import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCog, faUserCircle, faChartLine, faClipboardList, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Header.css';

export function Header() {
  // TODO: Replace with actual auth check
  const isLoggedIn = true;

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="app-title">Synchronicity AI</Link>
      </div>
      <div className="header-right">
        {isLoggedIn && (
          <>
            <Link to="/milestones" className="icon-button" aria-label="Milestones">
              <FontAwesomeIcon icon={faChartLine} />
              <span>Milestones</span>
            </Link>
            <Link to="/assessments" className="icon-button" aria-label="Assessments">
              <FontAwesomeIcon icon={faClipboardList} />
              <span>Assessments</span>
            </Link>
            <Link to="/team" className="icon-button" aria-label="Team">
              <FontAwesomeIcon icon={faUsers} />
              <span>Team</span>
            </Link>
            <button className="icon-button" aria-label="Notifications">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className="icon-button" aria-label="Settings">
              <FontAwesomeIcon icon={faCog} />
            </button>
            <button className="profile-button" aria-label="Account">
              <FontAwesomeIcon icon={faUserCircle} />
            </button>
          </>
        )}
      </div>
    </header>
  );
} 