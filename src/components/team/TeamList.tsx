import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../../amplify/data/resource';
import './TeamList.css';

interface Team {
  id: string;
  name: string;
  kidProfile?: {
    name: string;
    age: number;
  };
}

const TeamList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const currentUser = await getCurrentUser();
      const client = generateClient<Schema>();

      // Get user's existing team memberships
      const memberships = await client.models.TeamMember.list({
        filter: {
          userId: { eq: currentUser.userId }
        }
      });

      // Get user's pending team requests
      const requests = await client.models.TeamAccessRequest.list({
        filter: {
          userId: { eq: currentUser.userId }
        }
      });

      // Get all teams with their kid profiles
      const response = await client.models.Team.list();
      const teamsWithKidProfiles = await Promise.all(
        (response.data || []).map(async (team) => {
          const kidProfileResponse = team.kidProfile && await team.kidProfile();
          return {
            id: team.id || '',
            name: team.name || '',
            kidProfile: kidProfileResponse?.data ? {
              name: kidProfileResponse.data.name || '',
              age: kidProfileResponse.data.age || 0
            } : undefined
          };
        })
      );

      if (!teamsWithKidProfiles.length) {
        throw new Error('No teams found');
      }

      // Filter out teams the user is already a member of or has pending requests for
      const memberTeamIds = new Set(memberships.data?.map(m => m.teamId) || []);
      const requestTeamIds = new Set(requests.data?.map(r => r.teamId) || []);

      const availableTeams = teamsWithKidProfiles.filter((team: Team) => 
        !memberTeamIds.has(team.id) && !requestTeamIds.has(team.id)
      );

      setTeams(availableTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      const client = generateClient<Schema>();

      await client.models.TeamAccessRequest.create({
        userId: currentUser.userId,
        teamId: teamId,
        status: 'PENDING',
        requestedAt: new Date().toISOString()
      });

      // Refresh the team list
      await fetchTeams();
    } catch (err) {
      console.error('Error sending join request:', err);
      setError('Failed to send join request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchTeams} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="team-list-container">
      <h2>Available Teams</h2>
      {teams.length === 0 ? (
        <div className="empty-state">
          <p>No teams available to join at this time.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <h3>{team.name}</h3>
              {team.kidProfile && (
                <p className="team-info">
                  Child: {team.kidProfile.name}, Age: {team.kidProfile.age}
                </p>
              )}
              <button
                onClick={() => handleJoinRequest(team.id)}
                className="join-button"
              >
                Request to Join
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamList; 