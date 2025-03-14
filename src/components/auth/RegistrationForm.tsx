import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import './RegistrationForm.css';

type Step = 'userInfo' | 'roleSelection' | 'kidProfile' | 'teamSetup';
type UserRole = 'PARENT' | 'CAREGIVER' | 'CLINICIAN' | 'ADMIN' | 'SME';

interface RegistrationFormProps {
  onSuccess: (data: { userId: string; kidProfileId: string; teamId: string }) => void;
}

interface UserInfo {
  username: string;
  email: string;
  password: string;
  fName: string;
  lName: string;
  phoneNumber: string;
}

interface KidProfileInfo {
  name: string;
  dob: string;
  age: number;
  isAutismDiagnosed: boolean;
}

const client = generateClient<Schema>();

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<Step>('userInfo');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: '',
    email: '',
    password: '',
    fName: '',
    lName: '',
    phoneNumber: '',
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [kidProfile, setKidProfile] = useState<KidProfileInfo>({
    name: '',
    dob: '',
    age: 0,
    isAutismDiagnosed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.username || !userInfo.email || !userInfo.password) {
      setError('Please fill in all required fields');
      return;
    }
    setCurrentStep('roleSelection');
  };

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'PARENT') {
      setCurrentStep('kidProfile');
    } else {
      handleRegistration();
    }
  };

  const handleKidProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidProfile.name || !kidProfile.dob) {
      setError('Please fill in all required fields');
      return;
    }
    setCurrentStep('teamSetup');
  };

  const renderUserInfoForm = () => (
    <form onSubmit={handleUserInfoSubmit} className="user-info-form">
      <h2>Create Your Account</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Username"
          value={userInfo.username}
          onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={userInfo.email}
          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          value={userInfo.password}
          onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="First Name"
          value={userInfo.fName}
          onChange={(e) => setUserInfo({ ...userInfo, fName: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Last Name"
          value={userInfo.lName}
          onChange={(e) => setUserInfo({ ...userInfo, lName: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="tel"
          placeholder="Phone Number"
          value={userInfo.phoneNumber}
          onChange={(e) => setUserInfo({ ...userInfo, phoneNumber: e.target.value })}
          required
        />
      </div>
      <button type="submit">Next</button>
    </form>
  );

  const renderRoleSelection = () => (
    <div className="role-selection">
      <h2>Select Your Role</h2>
      <div className="role-buttons">
        <button onClick={() => handleRoleSelection('PARENT')}>Parent</button>
        <button onClick={() => handleRoleSelection('CAREGIVER')}>Caregiver</button>
        <button onClick={() => handleRoleSelection('CLINICIAN')}>Clinician</button>
      </div>
    </div>
  );

  const renderKidProfileForm = () => (
    <form onSubmit={handleKidProfileSubmit} className="kid-profile-form">
      <h2>Create Kid's Profile</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Child's Name"
          value={kidProfile.name}
          onChange={(e) => setKidProfile({ ...kidProfile, name: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="date"
          placeholder="Date of Birth"
          value={kidProfile.dob}
          onChange={(e) => {
            const dob = new Date(e.target.value);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            setKidProfile({
              ...kidProfile,
              dob: e.target.value,
              age: age,
            });
          }}
          required
        />
      </div>
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={kidProfile.isAutismDiagnosed}
            onChange={(e) => setKidProfile({ ...kidProfile, isAutismDiagnosed: e.target.checked })}
          />
          Has your child been diagnosed with autism?
        </label>
      </div>
      <button type="submit">Next</button>
    </form>
  );

  const renderTeamSetup = () => (
    <div className="team-setup">
      <h2>Profile Created Successfully!</h2>
      <p>What would you like to do next?</p>
      
      <div className="next-steps-container">
        <div className="next-step-option">
          <button 
            onClick={() => handleRegistration('DASHBOARD')}
            disabled={isSubmitting}
            className="next-step-button dashboard"
          >
            <span className="icon">📊</span>
            <h3>Go to Dashboard</h3>
            <p>View your child's profile and overall progress</p>
          </button>
        </div>

        <div className="next-step-option">
          <button 
            onClick={() => handleRegistration('ASSESSMENT')}
            disabled={isSubmitting}
            className="next-step-button assessment"
          >
            <span className="icon">📝</span>
            <h3>Start Assessment</h3>
            <p>Begin the developmental assessment (takes approximately 20 minutes)</p>
          </button>
        </div>

        <div className="next-step-option">
          <button 
            onClick={() => handleRegistration('TEAM')}
            disabled={isSubmitting}
            className="next-step-button team"
          >
            <span className="icon">👥</span>
            <h3>Manage Team</h3>
            <p>Invite caregivers, clinicians, or other team members</p>
          </button>
        </div>
      </div>

      {isSubmitting && (
        <div className="loading-message">
          Setting up your profile...
        </div>
      )}
    </div>
  );

  const handleRegistration = async (nextStep: 'DASHBOARD' | 'ASSESSMENT' | 'TEAM' = 'DASHBOARD') => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedRole) {
        setError('Please select a role');
        setIsSubmitting(false);
        return;
      }

      console.log('Starting registration process...');
      console.log('Creating user...');
      const userResponse = await client.models.User.create({
        username: userInfo.username,
        email: userInfo.email,
        password: userInfo.password,
        fName: userInfo.fName,
        lName: userInfo.lName,
        phoneNumber: userInfo.phoneNumber,
        role: selectedRole,
        status: 'PENDING'
      });

      if (!userResponse.data?.id) {
        throw new Error('Failed to create user');
      }
      console.log('User created successfully:', userResponse.data.id);

      if (selectedRole === 'PARENT') {
        console.log('Creating kid profile...');
        const kidResponse = await client.models.KidProfile.create({
          name: kidProfile.name,
          age: kidProfile.age,
          dob: kidProfile.dob,
          parentId: userResponse.data.id,
          isDummy: false,
          isAutismDiagnosed: kidProfile.isAutismDiagnosed
        });

        if (!kidResponse.data?.id) {
          throw new Error('Failed to create kid profile');
        }
        console.log('Kid profile created successfully:', kidResponse.data.id);

        console.log('Creating team...');
        const teamResponse = await client.models.Team.create({
          name: `${kidProfile.name}'s Team`,
          kidProfileId: kidResponse.data.id,
          adminId: userResponse.data.id
        });

        if (!teamResponse.data?.id) {
          throw new Error('Failed to create team');
        }
        console.log('Team created successfully:', teamResponse.data.id);

        const registrationData = {
          userId: userResponse.data.id,
          kidProfileId: kidResponse.data.id,
          teamId: teamResponse.data.id,
          nextStep
        };

        console.log('Registration completed successfully. Calling onSuccess with data:', registrationData);
        await Promise.resolve(onSuccess(registrationData));
      } else {
        const registrationData = {
          userId: userResponse.data.id,
          kidProfileId: '',
          teamId: '',
          nextStep: 'DASHBOARD'
        };
        console.log('Registration completed successfully for non-parent role. Calling onSuccess with data:', registrationData);
        await Promise.resolve(onSuccess(registrationData));
      }
      
      console.log('Navigation callback completed');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      {error && <div className="error-message">{error}</div>}
      {currentStep === 'userInfo' && renderUserInfoForm()}
      {currentStep === 'roleSelection' && renderRoleSelection()}
      {currentStep === 'kidProfile' && renderKidProfileForm()}
      {currentStep === 'teamSetup' && renderTeamSetup()}
    </div>
  );
};

export default RegistrationForm; 