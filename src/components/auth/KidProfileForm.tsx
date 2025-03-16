import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../amplify/data/resource';
import './KidProfileForm.css';

interface KidProfileFormProps {
  onSubmit: ({ kidProfileId }: { kidProfileId: string }) => void;
}

interface KidProfileInfo {
  name: string;
  dob: string;
  age: number;
  isAutismDiagnosed: boolean;
}

export function KidProfileForm({ onSubmit }: KidProfileFormProps) {
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
      const response = await client.models.KidProfile.create({
        name: kidProfile.name,
        dob: kidProfile.dob,
        age: kidProfile.age,
        isAutismDiagnosed: kidProfile.isAutismDiagnosed,
        parentId: currentUser.userId,
        isDummy: false
      });

      if (response?.data?.id) {
        onSubmit({ kidProfileId: response.data.id });
      } else {
        throw new Error('Failed to create kid profile');
      }
    } catch (err) {
      console.error('Error creating kid profile:', err);
      setError('Failed to create kid profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    const age = calculateAge(dob);
    
    setKidProfile(prev => ({
      ...prev,
      dob,
      age
    }));
  };

  return (
    <div className="kid-profile-container">
      <form className="kid-profile-form" onSubmit={handleSubmit}>
        <h2>Create Child Profile</h2>
        <p className="form-description">
          Please provide your child's information to help us personalize their development journey.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Child's Name *</label>
          <input
            type="text"
            id="name"
            value={kidProfile.name}
            onChange={(e) => setKidProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter child's name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth *</label>
          <input
            type="date"
            id="dob"
            value={kidProfile.dob}
            onChange={handleDOBChange}
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={kidProfile.isAutismDiagnosed}
              onChange={(e) => setKidProfile(prev => ({ ...prev, isAutismDiagnosed: e.target.checked }))}
            />
            <span>Has your child been diagnosed with autism?</span>
          </label>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}

export default KidProfileForm; 