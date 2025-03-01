import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCog, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Synchronicity AI</h1>
      </div>
      <div className="header-right">
        <button className="icon-button" aria-label="Notifications">
          <FontAwesomeIcon icon={faBell} />
        </button>
        <button className="icon-button" aria-label="Settings">
          <FontAwesomeIcon icon={faCog} />
        </button>
        <button className="icon-button" aria-label="Account">
          <FontAwesomeIcon icon={faUserCircle} />
        </button>
      </div>
    </header>
  );
} 