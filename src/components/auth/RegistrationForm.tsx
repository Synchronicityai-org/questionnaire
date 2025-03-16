import React, { useState } from 'react';
import { useAuth, ProfileType } from '../../hooks/useAuth';
import KidProfileForm from './KidProfileForm';
import './RegistrationForm.css';

interface RegistrationFormProps {
  onSuccess: (data: {
    userId: string;
    kidProfileId?: string;
    teamId?: string;
    nextStep: string;
    isNewRegistration: boolean;
    profileType: ProfileType;
  }) => void;
}

interface UserInfo {
  email: string;
  password: string;
  fName: string;
  lName: string;
  phoneNumber: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const { register, setProfileType } = useAuth();
  const [currentStep, setCurrentStep] = useState<'userInfo' | 'profileType' | 'kidProfile'>('userInfo');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: '',
    password: '',
    fName: '',
    lName: '',
    phoneNumber: ''
  });
  const [selectedProfileType, setSelectedProfileType] = useState<ProfileType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      
      // Register the user with Amplify Auth
      await register(
        userInfo.email,
        userInfo.password,
        userInfo.fName,
        userInfo.lName,
        userInfo.phoneNumber
      );

      // Move to profile type selection
      setCurrentStep('profileType');
    } catch (err) {
      console.error('Error in registration:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileTypeSelection = async (type: ProfileType) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSelectedProfileType(type);

      // Update the user's profile type
      await setProfileType(type);

      if (type === 'PARENT') {
        setCurrentStep('kidProfile');
      } else {
        // For CAREGIVER and CLINICIAN
        onSuccess({
          userId: userInfo.email, // We use email as username
          nextStep: 'TEAM',
          isNewRegistration: true,
          profileType: type
        });
      }
    } catch (err) {
      console.error('Error in profile type selection:', err);
      setError('Failed to set profile type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUserInfoForm = () => (
    <form onSubmit={handleUserInfoSubmit} className="user-info-form">
      <h2>Create Your Account</h2>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={userInfo.email}
          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={userInfo.password}
          onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="fName">First Name</label>
        <input
          type="text"
          id="fName"
          value={userInfo.fName}
          onChange={(e) => setUserInfo({ ...userInfo, fName: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="lName">Last Name</label>
        <input
          type="text"
          id="lName"
          value={userInfo.lName}
          onChange={(e) => setUserInfo({ ...userInfo, lName: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          value={userInfo.phoneNumber}
          onChange={(e) => setUserInfo({ ...userInfo, phoneNumber: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Continue'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );

  const renderProfileTypeSelection = () => (
    <div className="profile-type-selection">
      <h2>Select Your Role</h2>
      <p className="profile-description">Choose your role in the child's care journey</p>
      <div className="profile-buttons">
        <button 
          onClick={() => handleProfileTypeSelection('PARENT')}
          className={`profile-button ${selectedProfileType === 'PARENT' ? 'active' : ''}`}
          disabled={isSubmitting}
        >
          <span className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <h3>Parent</h3>
          <p>I am the child's parent or primary caregiver</p>
        </button>
        <button 
          onClick={() => handleProfileTypeSelection('CAREGIVER')}
          className={`profile-button ${selectedProfileType === 'CAREGIVER' ? 'active' : ''}`}
          disabled={isSubmitting}
        >
          <span className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M9 12h6"></path>
              <path d="M9 16h6"></path>
            </svg>
          </span>
          <h3>Caregiver</h3>
          <p>I provide care or support for the child</p>
        </button>
        <button 
          onClick={() => handleProfileTypeSelection('CLINICIAN')}
          className={`profile-button ${selectedProfileType === 'CLINICIAN' ? 'active' : ''}`}
          disabled={isSubmitting}
        >
          <span className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </span>
          <h3>Clinician</h3>
          <p>I am a healthcare professional</p>
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );

  // Render the appropriate step
  switch (currentStep) {
    case 'userInfo':
      return renderUserInfoForm();
    case 'profileType':
      return renderProfileTypeSelection();
    case 'kidProfile':
      return <KidProfileForm 
        onSubmit={(data) => {
          onSuccess({
            userId: userInfo.email,
            kidProfileId: data.kidProfileId,
            teamId: data.teamId,
            nextStep: 'DASHBOARD',
            isNewRegistration: true,
            profileType: 'PARENT'
          });
        }}
      />;
    default:
      return null;
  }
};

export default RegistrationForm; 