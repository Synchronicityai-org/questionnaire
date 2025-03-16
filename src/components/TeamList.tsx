import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import './TeamList.css';

const client = generateClient<Schema>();

interface Team {
  id: string;
  name: string;
  kidProfileId: string;
  kidProfile: {
    name: string;
    age: number;
  };
}

export function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingTeamId, setRequestingTeamId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get all teams
      const response = await client.models.Team.list();
      
      // Get user's existing team memberships
      const membershipResponse = await client.models.TeamMember.list({
        filter: {
          userId: { eq: userId }
        }
      });
      const userTeamIds = new Set(
        membershipResponse.data
          ?.map(m => m.teamId)
          .filter((id): id is string => id !== null) || []
      );

      // Get user's pending team requests
      const requestResponse = await client.models.TeamAccessRequest.list({
        filter: {
          userId: { eq: userId },
          status: { eq: 'PENDING' }
        }
      });
      const pendingRequestTeamIds = new Set(
        requestResponse.data
          ?.map(r => r.teamId)
          .filter((id): id is string => id !== null) || []
      );

      if (response?.data) {
        // Process teams in batches to avoid too many concurrent requests
        const processTeams = async (teams: any[]) => {
          const teamsWithProfiles = await Promise.all(
            teams
              .filter(team => {
                return team && team.id && !userTeamIds.has(team.id) && !pendingRequestTeamIds.has(team.id);
              })
              .map(async (team) => {
                try {
                  if (!team.id || !team.name || !team.kidProfileId) {
                    console.log('Invalid team data:', team);
                    return null;
                  }

                  const kidProfile = await client.models.KidProfile.get({
                    id: team.kidProfileId
                  });

                  if (!kidProfile.data) {
                    console.log('Kid profile not found for team:', team);
                    return null;
                  }

                  return {
                    id: team.id,
                    name: team.name,
                    kidProfileId: team.kidProfileId,
                    kidProfile: {
                      name: kidProfile.data.name || 'Unknown',
                      age: kidProfile.data.age || 0
                    }
                  };
                } catch (err) {
                  console.error('Error processing team:', team, err);
                  return null;
                }
              })
          );
          return teamsWithProfiles.filter((team): team is Team => team !== null);
        };

        // Process all teams
        const validTeams = await processTeams(response.data);
        console.log('Valid teams found:', validTeams);
        setTeams(validTeams);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      setRequestingTeamId(teamId);
      const userId = sessionStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await client.models.TeamAccessRequest.create({
        teamId,
        userId,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        message: message || undefined
      });

      alert('Join request sent successfully! The team admin will review your request.');
      setMessage('');
    } catch (err) {
      console.error('Error sending join request:', err);
      setError('Failed to send join request. Please try again.');
    } finally {
      setRequestingTeamId(null);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading teams...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="teams-container">
      <h2>Available Teams</h2>
      {teams.length === 0 ? (
        <div className="empty-state">
          <p>No teams available to join at the moment.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <h3>{team.name}</h3>
              <p className="kid-info">
                Child: {team.kidProfile.name} ({team.kidProfile.age} years old)
              </p>
              {requestingTeamId === team.id ? (
                <div className="join-request-form">
                  <textarea
                    placeholder="Add a message to the team admin (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="button-group">
                    <button 
                      onClick={() => handleJoinRequest(team.id)}
                      className="submit-request-btn"
                    >
                      Send Request
                    </button>
                    <button 
                      onClick={() => setRequestingTeamId(null)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setRequestingTeamId(team.id)}
                  className="join-team-btn"
                >
                  Request to Join
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 