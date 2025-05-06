import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './RegistrationForm.css';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  email: string;
  password: string;
  fName: string;
  lName: string;
  phoneNumber: string;
  termsAccepted: boolean;
}

const RegistrationForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: '',
    password: '',
    fName: '',
    lName: '',
    phoneNumber: '',
    termsAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userInfo.termsAccepted) {
      setError('Please accept the Terms & Conditions to continue.');
      return;
    }

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

      // Navigate to profile setup
      navigate('/profile-setup');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      <form className="user-info-form" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>
        
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            value={userInfo.password}
            onChange={(e) => setUserInfo(prev => ({ ...prev, password: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fName">First Name *</label>
            <input
              type="text"
              id="fName"
              value={userInfo.fName}
              onChange={(e) => setUserInfo(prev => ({ ...prev, fName: e.target.value }))}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lName">Last Name *</label>
            <input
              type="text"
              id="lName"
              value={userInfo.lName}
              onChange={(e) => setUserInfo(prev => ({ ...prev, lName: e.target.value }))}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number *</label>
          <input
            type="tel"
            id="phoneNumber"
            value={userInfo.phoneNumber}
            onChange={(e) => setUserInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={userInfo.termsAccepted}
              onChange={(e) => setUserInfo(prev => ({ ...prev, termsAccepted: e.target.checked }))}
              required
              disabled={isSubmitting}
            />
            <span>
              I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> *
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm; 