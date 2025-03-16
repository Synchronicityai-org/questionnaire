import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<'signIn' | 'signUp' | 'confirmSignUp'>('signIn');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if the number already has a country code
    if (digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // Add US country code (+1) if not present
    return `+1${digits}`;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for US phone numbers (10 digits)
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn({
        username: formData.email,
        password: formData.password,
      });
      onClose();
      navigate('/profile-setup');
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate phone number format
      if (!validatePhoneNumber(formData.phoneNumber)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const formattedPhone = formatPhoneNumber(formData.phoneNumber);

      await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            given_name: formData.firstName,
            family_name: formData.lastName,
            phone_number: formattedPhone
          }
        }
      });
      setAuthState('confirmSignUp');
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      // Handle specific error cases
      if (error.name === 'UsernameExistsException') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.name === 'InvalidPasswordException') {
        setError('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.');
      } else if (error.name === 'InvalidParameterException') {
        if (error.message.includes('phone')) {
          setError('Invalid phone number format. Please enter a valid phone number.');
        } else if (error.message.includes('email')) {
          setError('Invalid email format. Please enter a valid email address.');
        } else {
          setError(error.message);
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error creating account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Trim the code to remove any whitespace
      const cleanCode = formData.code.trim();
      
      // Validate code format
      if (!/^\d{6}$/.test(cleanCode)) {
        throw new Error('Please enter a valid 6-digit verification code');
      }

      await confirmSignUp({
        username: formData.email.toLowerCase().trim(),
        confirmationCode: cleanCode
      });

      // After confirmation, try to sign in
      try {
        await signIn({
          username: formData.email.toLowerCase().trim(),
          password: formData.password,
        });
        onClose();
        navigate('/profile-setup');
      } catch (signInError) {
        console.error('Error signing in after confirmation:', signInError);
        setError('Account verified! Please sign in with your credentials.');
        setAuthState('signIn');
      }
    } catch (error: any) {
      console.error('Error confirming sign up:', error);
      if (error.name === 'CodeMismatchException') {
        setError('Invalid verification code. Please check and try again.');
      } else if (error.name === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new code.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error verifying account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setLoading(true);

    try {
      await resendSignUpCode({
        username: formData.email.toLowerCase().trim()
      });
      setError('A new verification code has been sent to your email.');
    } catch (error: any) {
      console.error('Error resending code:', error);
      if (error.name === 'LimitExceededException') {
        setError('Too many attempts. Please wait a while before requesting a new code.');
      } else {
        setError('Error sending new code. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setAuthState('signIn');
    setFormData({
      email: '',
      password: '',
      code: '',
      firstName: '',
      lastName: '',
      phoneNumber: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const renderSignIn = () => (
    <form onSubmit={handleSignIn} className="auth-form">
      <h2>Welcome Back</h2>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="auth-switch">
        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={() => setAuthState('signUp')}
          className="link-button"
        >
          Sign Up
        </button>
      </p>
      {error && <div className="error-message">{error}</div>}
    </form>
  );

  const renderSignUp = () => (
    <form onSubmit={handleSignUp} className="auth-form">
      <h2>Create Account</h2>
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number (10 digits)</label>
        <input
          type="tel"
          id="phoneNumber"
          placeholder="1234567890"
          pattern="[0-9]{10}"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
          required
        />
        <small className="input-help">Enter 10 digits without spaces or special characters</small>
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <p className="auth-switch">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={() => setAuthState('signIn')}
          className="link-button"
        >
          Sign In
        </button>
      </p>
      {error && <div className="error-message">{error}</div>}
    </form>
  );

  const renderConfirmSignUp = () => (
    <form onSubmit={handleConfirmSignUp} className="auth-form">
      <h2>Verify Your Account</h2>
      <p className="verification-info">
        Please enter the verification code sent to your email address: {formData.email}
      </p>
      <div className="form-group">
        <label htmlFor="code">Verification Code</label>
        <input
          type="text"
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })}
          maxLength={6}
          pattern="\d{6}"
          placeholder="Enter 6-digit code"
          required
        />
        <small className="input-help">Enter the 6-digit code from your email</small>
      </div>
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Account'}
      </button>
      <button 
        type="button" 
        className="resend-button"
        onClick={handleResendCode}
        disabled={loading}
      >
        Resend Code
      </button>
      <p className="auth-switch">
        Wrong email?{' '}
        <button 
          type="button" 
          onClick={() => setAuthState('signUp')}
          className="link-button"
        >
          Start Over
        </button>
      </p>
      {error && <div className="error-message">{error}</div>}
    </form>
  );

  const renderContent = () => {
    switch (authState) {
      case 'signUp':
        return renderSignUp();
      case 'confirmSignUp':
        return renderConfirmSignUp();
      default:
        return renderSignIn();
    }
  };

  return (
    <div className="auth-modal" onClick={handleClose}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={handleClose}>&times;</button>
        {renderContent()}
      </div>
    </div>
  );
};

export default Auth; 