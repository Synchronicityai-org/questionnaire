import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../amplify/data/resource';
import './ProfileSetup.css';

type UserRole = 'PARENT' | 'CAREGIVER' | 'CLINICIAN';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async (role: UserRole) => {
    if (loading) return;
    setSelectedRole(role);
    setLoading(true);
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      const client = generateClient<Schema>();

      // Create user profile with selected role
      const profile = await client.models.User.create({
        id: currentUser.userId,
        role: role,
        status: 'ACTIVE'
      });

      if (!profile.data?.id) {
        throw new Error('Failed to create user profile');
      }

      // Navigate based on role
      if (role === 'PARENT') {
        navigate('/kid-profile-form');
      } else {
        navigate('/team-list');
      }
    } catch (err) {
      console.error('Error setting up profile:', err);
      setError('Failed to set up profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-content">
        <h2>Select Your Role</h2>
        <p className="profile-description">Choose your role in the child's care journey</p>

        {error && <div className="error-message">{error}</div>}

        <div className="role-buttons">
          <button 
            onClick={() => handleRoleSelection('PARENT')}
            className={`role-button ${selectedRole === 'PARENT' ? 'active' : ''}`}
            disabled={loading}
          >
            <span className="icon">👨‍👩‍👧‍👦</span>
            <h3>Parent</h3>
            <p>I am the child's parent or primary caregiver</p>
          </button>

          <button 
            onClick={() => handleRoleSelection('CAREGIVER')}
            className={`role-button ${selectedRole === 'CAREGIVER' ? 'active' : ''}`}
            disabled={loading}
          >
            <span className="icon">👩‍⚕️</span>
            <h3>Caregiver</h3>
            <p>I provide care or support for the child</p>
          </button>

          <button 
            onClick={() => handleRoleSelection('CLINICIAN')}
            className={`role-button ${selectedRole === 'CLINICIAN' ? 'active' : ''}`}
            disabled={loading}
          >
            <span className="icon">🏥</span>
            <h3>Clinician</h3>
            <p>I am a healthcare professional</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup; 