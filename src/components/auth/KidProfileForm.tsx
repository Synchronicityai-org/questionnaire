import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../amplify/data/resource';
import './RegistrationForm.css';

interface KidProfileFormProps {
  onSubmit: (data: { kidProfileId: string; teamId: string }) => void;
}

interface KidProfileInfo {
  name: string;
  dob: string;
  age: number;
  isAutismDiagnosed: boolean;
}

const KidProfileForm: React.FC<KidProfileFormProps> = ({ onSubmit }) => {
  const [kidProfile, setKidProfile] = useState<KidProfileInfo>({
    name: '',
    dob: '',
    age: 0,
    isAutismDiagnosed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!kidProfile.name || !kidProfile.dob) {
        setError('Please fill in all required fields');
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser?.userId) {
        throw new Error('User not authenticated');
      }

      const client = generateClient<Schema>();

      // Create kid profile
      const kidResponse = await client.models.KidProfile.create({
        name: kidProfile.name,
        age: kidProfile.age,
        dob: kidProfile.dob,
        parentId: currentUser.userId,
        isDummy: false,
        isAutismDiagnosed: kidProfile.isAutismDiagnosed
      });

      if (!kidResponse.data?.id) {
        throw new Error('Failed to create kid profile');
      }

      // Create team with retry logic
      let teamResponse = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries && !teamResponse?.data?.id) {
        try {
          teamResponse = await client.models.Team.create({
            name: `${kidProfile.name}'s Team`,
            kidProfileId: kidResponse.data.id,
            adminId: currentUser.userId
          });
          
          if (!teamResponse.data?.id) {
            throw new Error('Team creation response missing ID');
          }
        } catch (teamError) {
          console.error(`Team creation attempt ${retryCount + 1} failed:`, teamError);
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error('Failed to create team after multiple attempts');
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      // Verify team was created
      if (!teamResponse?.data?.id) {
        throw new Error('Failed to create team');
      }

      // Wait for a moment to ensure team creation is complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify team exists
      try {
        const teamVerification = await client.models.Team.get({ id: teamResponse.data.id });
        if (!teamVerification.data) {
          throw new Error('Team not found after creation');
        }
      } catch (verifyError) {
        console.error('Team verification failed:', verifyError);
        throw new Error('Team creation could not be verified');
      }

      onSubmit({
        kidProfileId: kidResponse.data.id,
        teamId: teamResponse.data.id
      });
    } catch (err) {
      console.error('Error in profile/team creation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile and team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-info-form">
      <h2>Create Child's Profile</h2>
      <div className="form-group">
        <label htmlFor="childName">Child's Name</label>
        <input
          id="childName"
          type="text"
          value={kidProfile.name}
          onChange={(e) => setKidProfile({ ...kidProfile, name: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <label htmlFor="childDob">Date of Birth</label>
        <input
          id="childDob"
          type="date"
          value={kidProfile.dob}
          onChange={(e) => {
            const dob = new Date(e.target.value);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            setKidProfile({
              ...kidProfile,
              dob: e.target.value,
              age: age
            });
          }}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={kidProfile.isAutismDiagnosed}
            onChange={(e) => setKidProfile({ ...kidProfile, isAutismDiagnosed: e.target.checked })}
            disabled={isSubmitting}
          />
          <span>Has your child been diagnosed with autism?</span>
        </label>
      </div>
      {error && <div className="error-message">{error}</div>}
      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Profile and Team...' : 'Create Profile'}
      </button>
    </form>
  );
};

export default KidProfileForm; 