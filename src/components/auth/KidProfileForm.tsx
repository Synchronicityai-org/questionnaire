import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../amplify/data/resource';
import './RegistrationForm.css';

interface KidProfileFormProps {
  onSubmit: (kidProfileId: string, teamId: string) => void;
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

      // Create team
      const teamResponse = await client.models.Team.create({
        name: `${kidProfile.name}'s Team`,
        kidProfileId: kidResponse.data.id,
        adminId: currentUser.userId
      });

      if (!teamResponse.data?.id) {
        throw new Error('Failed to create team');
      }

      onSubmit(kidResponse.data.id, teamResponse.data.id);
    } catch (err) {
      console.error('Error creating kid profile:', err);
      setError('Failed to create profile. Please try again.');
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
        {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
      </button>
    </form>
  );
};

export default KidProfileForm; 