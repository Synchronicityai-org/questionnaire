import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import RoleSelection from './RoleSelection';
import './Auth.css';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ isOpen, onClose }) => {
  const [authState, setAuthState] = useState<'signIn' | 'signUp' | 'confirmSignUp'>('signIn');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
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
  const [showCloseWarning, setShowCloseWarning] = useState(false);

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
      const username = formData.email.toLowerCase().trim();
      const { nextStep } = await signIn({
        username,
        password: formData.password,
        options: {
          authFlowType: "USER_SRP_AUTH"
        }
      });

      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setAuthState('confirmSignUp');
        setError('Please verify your email before signing in.');
        return;
      }

      if (nextStep.signInStep === 'DONE') {
        setShowRoleSelection(true);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Handle specific error cases
      if (error.name === 'UserNotConfirmedException') {
        setAuthState('confirmSignUp');
        setError('Please verify your email before signing in.');
      } else if (error.name === 'NotAuthorizedException') {
        setError('Incorrect username or password.');
      } else if (error.name === 'UserNotFoundException') {
        setError('No account found with this email.');
      } else if (error.name === 'InvalidParameterException') {
        setError('Please enter a valid email and password.');
      } else {
        setError('Error signing in. Please try again.');
      }
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
      const username = formData.email.toLowerCase().trim();

      const { nextStep } = await signUp({
        username,
        password: formData.password,
        options: {
          userAttributes: {
            email: username,
            given_name: formData.firstName.trim(),
            family_name: formData.lastName.trim(),
            phone_number: formattedPhone
          }
        }
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setAuthState('confirmSignUp');
      }
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
      const cleanCode = formData.code.trim();
      const username = formData.email.toLowerCase().trim();
      
      if (!/^\d{6}$/.test(cleanCode)) {
        throw new Error('Please enter a valid 6-digit verification code');
      }

      await confirmSignUp({
        username,
        confirmationCode: cleanCode
      });

      try {
        const { nextStep } = await signIn({
          username,
          password: formData.password,
          options: {
            authFlowType: "USER_SRP_AUTH"
          }
        });

        if (nextStep.signInStep === 'DONE') {
          setShowRoleSelection(true);
        } else {
          setError('Account verified! Please sign in with your credentials.');
          setAuthState('signIn');
        }
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
    if (authState === 'confirmSignUp') {
      setShowCloseWarning(true);
      return;
    }

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

  const handleConfirmClose = () => {
    setShowCloseWarning(false);
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

  const handleCancelClose = () => {
    setShowCloseWarning(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
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
      <h2>Verify Your Email</h2>
      <p className="verification-info">
        Please enter the verification code sent to {formData.email}
      </p>
      <div className="form-group">
        <label htmlFor="code">Verification Code</label>
        <input
          type="text"
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Enter 6-digit code"
          required
          disabled={loading}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>
      <button
        type="button"
        onClick={handleResendCode}
        className="link-button"
        disabled={loading}
      >
        Resend verification code
      </button>
      <button
        type="button"
        onClick={() => setAuthState('signIn')}
        className="link-button"
        disabled={loading}
      >
        Back to Sign In
      </button>
    </form>
  );

  return (
    <>
      <div className="auth-overlay" onClick={handleBackdropClick}>
        <div className="auth-modal">
          {showCloseWarning ? (
            <div className="warning-dialog">
              <h3>Are you sure?</h3>
              <p>If you close now, you'll need to start the verification process again.</p>
              <div className="warning-buttons">
                <button onClick={handleCancelClose} className="cancel-button">
                  Stay Here
                </button>
                <button onClick={handleConfirmClose} className="confirm-button">
                  Yes, Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {authState === 'signIn' && renderSignIn()}
              {authState === 'signUp' && renderSignUp()}
              {authState === 'confirmSignUp' && renderConfirmSignUp()}
            </>
          )}
        </div>
      </div>
      <RoleSelection 
        isOpen={showRoleSelection} 
        onClose={() => {
          setShowRoleSelection(false);
          onClose();
        }}
        isModal={true}
      />
    </>
  );
};

export default Auth; 