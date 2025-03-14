import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import './TeamRequestsManagement.css';

const client = generateClient<Schema>();

interface TeamRequest {
  id: string;
  teamId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  message?: string;
  user?: {
    username: string;
    fName: string;
    lName: string;
    role: string;
  };
}

export function TeamRequestsManagement({ teamId }: { teamId: string }) {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [teamId]);

  const fetchRequests = async () => {
    try {
      const response = await client.models.TeamAccessRequest.list({
        filter: {
          teamId: { eq: teamId }
        }
      });

      if (response?.data) {
        const requestsWithUsers = await Promise.all(
          response.data.map(async (request) => {
            if (!request.userId || !request.id || !request.teamId || !request.status || !request.requestedAt) {
              return null;
            }

            const userResponse = await client.models.User.get({
              id: request.userId
            });
            
            if (!userResponse.data) {
              return null;
            }

            const teamRequest: TeamRequest = {
              id: request.id,
              teamId: request.teamId,
              userId: request.userId,
              status: request.status as 'PENDING' | 'APPROVED' | 'REJECTED',
              requestedAt: request.requestedAt,
              message: typeof request.message === 'string' ? request.message : undefined,
              user: {
                username: userResponse.data.username ?? '',
                fName: userResponse.data.fName ?? '',
                lName: userResponse.data.lName ?? '',
                role: userResponse.data.role ?? ''
              }
            };
            return teamRequest;
          })
        );

        const validRequests = requestsWithUsers.filter((req): req is NonNullable<typeof req> => req !== null);
        setRequests(validRequests);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load team requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await client.models.TeamAccessRequest.update({
        id: requestId,
        status,
        responseMessage: responseMessage || undefined,
        respondedAt: new Date().toISOString()
      });

      if (status === 'APPROVED') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await client.models.TeamMember.create({
            teamId: request.teamId,
            userId: request.userId,
            role: 'MEMBER',
            status: 'ACTIVE',
            invitedBy: 'SYSTEM',
            invitedAt: new Date().toISOString(),
            joinedAt: new Date().toISOString()
          });
        }
      }

      setResponseMessage('');
      await fetchRequests();
    } catch (err) {
      console.error('Error handling request:', err);
      setError('Failed to process request');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading requests...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="team-requests">
      <h2>Team Access Requests</h2>
      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No pending requests</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <h3>{request.user?.fName} {request.user?.lName}</h3>
                <p className="role">{request.user?.role}</p>
                <p className="timestamp">
                  Requested: {new Date(request.requestedAt).toLocaleDateString()}
                </p>
                {request.message && (
                  <p className="message">"{request.message}"</p>
                )}
              </div>
              {request.status === 'PENDING' && (
                <div className="response-actions">
                  <textarea
                    placeholder="Add a response message (optional)"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                  <div className="button-group">
                    <button
                      onClick={() => handleRequestResponse(request.id, 'APPROVED')}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestResponse(request.id, 'REJECTED')}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
              {request.status !== 'PENDING' && (
                <div className={`status ${request.status.toLowerCase()}`}>
                  {request.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 