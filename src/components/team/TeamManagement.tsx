import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../../amplify/data/resource';
import './TeamManagement.css';

interface TeamAccessRequest {
  id: string;
  userId: string;
  teamId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  requestedAt: string;
  user?: {
    id: string;
    email: string;
    fName: string;
    lName: string;
  };
}

interface Team {
  id: string;
  name: string;
  kidProfileId: string;
  adminId: string;
}

const TeamManagement: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [requests, setRequests] = useState<TeamAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchRequests();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const client = generateClient<Schema>();
      const response = await client.models.Team.get({ id: teamId! });

      if (!response.data) {
        throw new Error('Team not found');
      }

      setTeam({
        id: response.data.id || '',
        name: response.data.name || '',
        kidProfileId: response.data.kidProfileId || '',
        adminId: response.data.adminId || ''
      });
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Failed to load team information');
    }
  };

  const fetchRequests = async () => {
    try {
      const client = generateClient<Schema>();
      const response = await client.models.TeamAccessRequest.list({
        filter: {
          teamId: { eq: teamId },
          status: { eq: 'PENDING' }
        }
      });

      if (!response.data) {
        return;
      }

      // Fetch user details for each request
      const requestsWithUsers = await Promise.all(
        response.data.map(async (request) => {
          if (!request.userId) return null;

          const userResponse = await client.models.User.get({
            id: request.userId
          });

          if (!userResponse.data) return null;

          return {
            id: request.id || '',
            userId: request.userId,
            teamId: request.teamId || '',
            status: request.status || 'PENDING',
            message: request.message || undefined,
            requestedAt: request.requestedAt || new Date().toISOString(),
            user: {
              id: userResponse.data.id || '',
              email: userResponse.data.email || '',
              fName: userResponse.data.fName || '',
              lName: userResponse.data.lName || ''
            }
          } as TeamAccessRequest;
        })
      );

      // Filter out any null values and set the requests
      setRequests(requestsWithUsers.filter((r): r is TeamAccessRequest => r !== null));
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load team requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      setLoading(true);
      const client = generateClient<Schema>();

      // Update the request status
      await client.models.TeamAccessRequest.update({
        id: requestId,
        status: action
      });

      // If approved, create a team member
      if (action === 'APPROVED') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await client.models.TeamMember.create({
            userId: request.userId,
            teamId: teamId!,
            role: 'MEMBER',
            status: 'ACTIVE',
            invitedAt: new Date().toISOString(),
            joinedAt: new Date().toISOString()
          });
        }
      }

      // Refresh the requests list
      await fetchRequests();
    } catch (err) {
      console.error('Error handling request:', err);
      setError(`Failed to ${action.toLowerCase()} request`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading team information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="team-management-container">
      <h2>{team?.name || 'Team Management'}</h2>
      
      <section className="requests-section">
        <h3>Pending Join Requests</h3>
        {requests.length === 0 ? (
          <p className="empty-state">No pending requests</p>
        ) : (
          <div className="requests-list">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="user-info">
                  <h4>{request.user?.fName} {request.user?.lName}</h4>
                  <p>{request.user?.email}</p>
                  <p className="requested-at">
                    Requested: {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="action-buttons">
                  <button
                    onClick={() => handleRequestAction(request.id, 'APPROVED')}
                    className="approve-button"
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRequestAction(request.id, 'REJECTED')}
                    className="reject-button"
                    disabled={loading}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeamManagement; 