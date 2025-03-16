import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

interface RoleSelectionProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ isOpen, onClose, isModal = false }) => {
  const navigate = useNavigate();

  const handleRoleSelect = async (role: 'parent' | 'caregiver' | 'clinician') => {
    // TODO: Store the role in the user's attributes
    
    switch (role) {
      case 'parent':
        navigate('/create-kid-profile');
        break;
      case 'caregiver':
      case 'clinician':
        navigate('/team-request');
        break;
    }
    if (isModal) {
      onClose?.();
    }
  };

  // If it's a modal and not open, don't render
  if (isModal && !isOpen) return null;

  const content = (
    <div className="role-selection-modal">
      <h2>Choose Your Role</h2>
      <p>Please select your role to continue:</p>
      
      <div className="role-buttons">
        <button onClick={() => handleRoleSelect('parent')}>
          <h3>Parent</h3>
          <p>Create and manage your child's profile and team</p>
        </button>
        
        <button onClick={() => handleRoleSelect('caregiver')}>
          <h3>Caregiver</h3>
          <p>Join a team to support a child's development</p>
        </button>
        
        <button onClick={() => handleRoleSelect('clinician')}>
          <h3>Clinician</h3>
          <p>Provide professional support as part of a child's care team</p>
        </button>
      </div>
    </div>
  );

  // If it's a modal, wrap in overlay
  if (isModal) {
    return (
      <div className="role-selection-overlay">
        {content}
      </div>
    );
  }

  // If it's a route component, wrap in container
  return (
    <div className="role-selection-container">
      {content}
    </div>
  );
};

export default RoleSelection; 