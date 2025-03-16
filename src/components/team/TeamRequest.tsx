import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../amplify/data/resource';
import './TeamRequest.css';

const TeamRequest: React.FC = () => {
  const navigate = useNavigate();
  const [teamCode, setTeamCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const client = generateClient<Schema>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { username } = await getCurrentUser();
      
      // Create team access request
      await client.models.TeamAccessRequest.create({
        teamId: teamCode,
        userId: username,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        message: message.trim() || undefined
      });

      // Navigate to dashboard with pending status
      navigate('/dashboard', { 
        state: { 
          message: 'Team access request submitted successfully. You will be notified when the request is approved.' 
        } 
      });
    } catch (error: any) {
      console.error('Error submitting team request:', error);
      setError('Error submitting team request. Please check the team code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-request-container">
      <div className="team-request-content">
        <h1>Join a Team</h1>
        <p>Enter the team code provided by the parent to request access.</p>

        <form onSubmit={handleSubmit} className="team-request-form">
          <div className="form-group">
            <label htmlFor="teamCode">Team Code</label>
            <input
              type="text"
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.trim())}
              placeholder="Enter team code"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message (Optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the team admin"
              rows={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting Request...' : 'Submit Request'}
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamRequest; 