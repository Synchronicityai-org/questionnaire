import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import './TeamManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserPlus, faSearch, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface TeamMember {
  id: string;
  name: string;
  role: 'CLINICIAN' | 'CAREGIVER' | 'MEMBER';
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  email?: string;
  joinedAt?: string;
}

interface Team {
  id: string;
  name: string;
  kidProfileId: string;
  adminId: string;
}

interface TeamData {
  id: string | null;
  name?: string | null;
  kidProfileId?: string | null;
  adminId?: string | null;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  role: 'CLINICIAN' | 'CAREGIVER';
}

interface TeamRequest {
  id: string;
  userId: string;
  teamId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  message?: string;
}

const TeamManagement: React.FC = () => {
  const { kidProfileId } = useParams<{ kidProfileId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (kidProfileId) {
      fetchTeamAndMembers();
      fetchTeamRequests();
    }
  }, [kidProfileId]);

  // Separate effect for fetching requests when team changes
  useEffect(() => {
    if (team?.id) {
      console.log('Team changed, fetching requests for team:', team.id);
      fetchTeamRequests();
    }
  }, [team?.id]);

  const fetchTeamAndMembers = async () => {
    if (!kidProfileId) return;

    try {
      setLoading(true);
      const client = generateClient<Schema>();

      // First get or create the team for this kid profile
      const teamsResponse = await client.models.Team.list({
        filter: { kidProfileId: { eq: kidProfileId } }
      });

      let teamData: TeamData | null = teamsResponse.data?.[0] || null;
      
      if (!teamData) {
        // Create a new team if none exists
        const createTeamResponse = await client.models.Team.create({
          kidProfileId: kidProfileId,
          name: 'Support Team',
          adminId: 'system'
        });
        teamData = createTeamResponse.data || null;
      }

      if (!teamData?.id) {
        throw new Error('Failed to get or create team');
      }

      setTeam({
        id: teamData.id,
        name: teamData.name ?? 'Support Team',
        kidProfileId: teamData.kidProfileId ?? kidProfileId,
        adminId: teamData.adminId ?? 'system'
      });

      // Fetch team members
      const membersResponse = await client.models.TeamMember.list({
        filter: { teamId: { eq: teamData.id } }
      });

      if (membersResponse.data) {
        const members = await Promise.all(
          membersResponse.data.map(async (member) => {
            if (!member.userId) return null;

            const userResponse = await client.models.User.get({
              id: member.userId
            });

            const userData = userResponse?.data;
            if (!userData?.fName) return null;

            return {
              id: member.id || '',
              name: `${userData.fName} ${userData.lName || ''}`,
              role: userData.role || 'MEMBER',
              status: member.status as 'ACTIVE' | 'PENDING' | 'INACTIVE',
              email: userData.email || undefined,
              joinedAt: member.joinedAt
            } as TeamMember;
          })
        );

        setTeamMembers(members.filter((m): m is TeamMember => m !== null));
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError('Failed to load team information');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamRequests = async () => {
    try {
      const client = generateClient<Schema>();
      
      // Get all access requests
      const allRequestsResponse = await client.models.TeamAccessRequest.list();
      console.log('All requests in system:', allRequestsResponse.data);

      // Look for the specific request by ID
      const specificRequest = allRequestsResponse.data?.find(req => 
        req.id === '8f3b0b4a-df59-46da-9e6d-fb2acf9c558b' &&
        req.teamId === '99a9f28b-40a7-407f-9dc0-f1a260437ef7'
      );
      console.log('Found specific request:', specificRequest);

      if (specificRequest) {
        const userResponse = await client.models.User.get({
          id: specificRequest.userId
        });
        console.log('User data for request:', userResponse?.data);

        const userData = userResponse?.data;
        if (userData) {
          const request = {
            id: specificRequest.id,
            userId: userData.id,
            teamId: specificRequest.teamId,
            status: specificRequest.status || 'PENDING',
            createdAt: specificRequest.requestedAt || new Date().toISOString(),
            // Use email as name if no first/last name available
            userName: userData.email || 'Unknown User',
            userEmail: userData.email || '',
            userRole: userData.role || 'CAREGIVER',
            message: specificRequest.message || undefined
          } as TeamRequest;

          console.log('Processing request into:', request);
          setTeamRequests([request]);
        }
      } else {
        // If we don't find the specific request, look for any requests for this team
        const teamRequests = allRequestsResponse.data?.filter(req => 
          req.teamId === '99a9f28b-40a7-407f-9dc0-f1a260437ef7'
        );
        
        if (teamRequests && teamRequests.length > 0) {
          const processedRequests = await Promise.all(
            teamRequests.map(async (request) => {
          const userResponse = await client.models.User.get({
            id: request.userId
          });

              const userData = userResponse?.data;
              if (!userData) return null;

          return {
                id: request.id,
                userId: userData.id,
                teamId: request.teamId,
            status: request.status || 'PENDING',
                createdAt: request.requestedAt || new Date().toISOString(),
                userName: userData.email || 'Unknown User',
                userEmail: userData.email || '',
                userRole: userData.role || 'CAREGIVER',
                message: request.message || undefined
              } as TeamRequest;
            })
          );

          const validRequests = processedRequests.filter((r): r is TeamRequest => r !== null);
          console.log('All team requests:', validRequests);
          setTeamRequests(validRequests);
        }
      }
    } catch (err) {
      console.error('Error fetching team requests:', err);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      setLoading(true);
      const client = generateClient<Schema>();

      const request = teamRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      await client.models.TeamAccessRequest.update({
        id: requestId,
        status: action
      });

      if (action === 'APPROVED') {
          await client.models.TeamMember.create({
          teamId: team!.id,
            userId: request.userId,
            role: 'MEMBER',
            status: 'ACTIVE',
          invitedBy: 'system',
            invitedAt: new Date().toISOString(),
            joinedAt: new Date().toISOString()
          });
        }

      await Promise.all([fetchTeamAndMembers(), fetchTeamRequests()]);
    } catch (err) {
      console.error('Error handling team request:', err);
      setError('Failed to process team request');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      setLoading(true);
      const client = generateClient<Schema>();

      await client.models.TeamMember.delete({
        id: memberId
      });

      // Refresh the team members list
      await fetchTeamAndMembers();
    } catch (err) {
      console.error('Error removing team member:', err);
      setError('Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (email: string, role: 'CLINICIAN' | 'CAREGIVER') => {
    if (!team?.id) return;

    try {
      setLoading(true);
      const client = generateClient<Schema>();

      // First check if user exists
      const usersResponse = await client.models.User.list({
        filter: { email: { eq: email } }
      });

      let userId: string | null = usersResponse.data?.[0]?.id ?? null;

      if (!userId) {
        // Create new user if doesn't exist
        const createUserResponse = await client.models.User.create({
          email: email,
          role: role,
          fName: 'New',
          lName: 'Member',
          status: 'PENDING',
          username: email.split('@')[0],
          phoneNumber: '+1234567890',
          address: 'Pending',
          dob: new Date().toISOString().split('T')[0],
          mName: '-'
        });
        userId = createUserResponse.data?.id ?? null;
      }

      if (!userId) {
        throw new Error('Failed to get or create user');
      }

      // Add team member
      await client.models.TeamMember.create({
        teamId: team.id,
        userId: userId,
        role: 'MEMBER',
        status: 'PENDING',
        invitedAt: new Date().toISOString()
      });

      // Refresh team members
      await fetchTeamAndMembers();
      setShowAddMember(false);
    } catch (err) {
      console.error('Error adding team member:', err);
      setError('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const client = generateClient<Schema>();

      // Search for users who are either clinicians or caregivers
      const usersResponse = await client.models.User.list({
        filter: {
          and: [
            {
              or: [
                { role: { eq: 'CLINICIAN' } },
                { role: { eq: 'CAREGIVER' } }
              ]
            },
            {
              or: [
                { fName: { contains: query } },
                { lName: { contains: query } },
                { email: { contains: query } }
              ]
            }
          ]
        }
      });

      if (usersResponse.data) {
        const filteredUsers = usersResponse.data
          .filter(user => 
            user.id && 
            (user.role === 'CLINICIAN' || user.role === 'CAREGIVER')
          )
          .map(user => ({
            id: user.id!,
            name: `${user.fName} ${user.lName || ''}`,
            email: user.email || '',
            role: user.role as 'CLINICIAN' | 'CAREGIVER'
          }));
        setSearchResults(filteredUsers);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddExistingMember = async (user: SearchUser) => {
    if (!team?.id) return;

    try {
      setLoading(true);
      const client = generateClient<Schema>();

      // Add team member
      await client.models.TeamMember.create({
        teamId: team.id,
        userId: user.id,
        status: 'PENDING',
        invitedAt: new Date().toISOString()
      });

      // Refresh team members
      await fetchTeamAndMembers();
      setShowAddMember(false);
      setSearchResults([]);
      setAddMemberSearch('');
    } catch (err) {
      console.error('Error adding team member:', err);
      setError('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/kid-profile/${kidProfileId}`);
  };

  if (loading) {
    return (
      <div className="team-management-container">
        <div className="loading-spinner" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="team-management-container">
        <div className="error-message" role="alert">
          {error || 'Team not found'}
        </div>
        <button onClick={() => window.location.reload()} className="primary-button">
          Retry
        </button>
      </div>
    );
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="team-management-container">
      <div className="team-management-header">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>
        <h2>{team.name} - Team Management</h2>
      </div>

      <div className="team-content">
        <div className="main-content">
          {teamRequests.length > 0 && (
            <div className="team-requests-section">
              <h3>Pending Requests ({teamRequests.length})</h3>
              {teamRequests.map(request => (
              <div key={request.id} className="request-card">
                  <div className="request-info">
                    <div className="request-details">
                      <h4>{request.userName || 'Unknown User'}</h4>
                      <p className="request-email">{request.userEmail}</p>
                      <p className="request-role">{request.userRole}</p>
                      {request.message && (
                        <p className="request-message">"{request.message}"</p>
                      )}
                      <p className="request-date">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                  </div>
                  <div className="request-actions">
                  <button
                      className="approve-button"
                    onClick={() => handleRequestAction(request.id, 'APPROVED')}
                  >
                      <FontAwesomeIcon icon={faCheck} /> Approve
                  </button>
                  <button
                      className="reject-button"
                    onClick={() => handleRequestAction(request.id, 'REJECTED')}
                  >
                      <FontAwesomeIcon icon={faTimes} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

          <div className="team-members-section">
            <table className="team-members-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.role}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`status-badge status-${member.status.toLowerCase()}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button
                        className="primary-button"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sidebar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search team members"
              />
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </div>
            <button className="primary-button" onClick={() => setShowAddMember(true)}>
              <FontAwesomeIcon icon={faUserPlus} /> Add Member
            </button>
          </div>

          <div className="team-stats">
            <h3>Team Statistics</h3>
            <div className="stat-item">
              <label>Total Members</label>
              <span>{teamMembers.length}</span>
            </div>
            <div className="stat-item">
              <label>Active Members</label>
              <span>{teamMembers.filter(m => m.status === 'ACTIVE').length}</span>
            </div>
            <div className="stat-item">
              <label>Pending Requests</label>
              <span>{teamRequests.length}</span>
            </div>
          </div>
        </div>
      </div>

      {showAddMember && (
        <div className="add-member-modal">
          <div className="modal-content">
            <button 
              className="modal-close-button" 
              onClick={() => setShowAddMember(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <div className="modal-header">
              <h3>Add Team Member</h3>
            </div>
            <div className="modal-search-section">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="add-member-search"
                value={addMemberSearch}
                onChange={(e) => {
                  setAddMemberSearch(e.target.value);
                  searchUsers(e.target.value);
                }}
              />
            </div>
            <div className="modal-scrollable-content">
              {searchLoading && <div className="loading-spinner"></div>}

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div key={user.id} className="search-result-item">
                      <div className="user-info">
                        <div className="avatar-placeholder">{user.name[0]}</div>
                        <div>
                          <h4>{user.name}</h4>
                          <p>{user.email}</p>
                          <span className="role-badge">{user.role}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddExistingMember(user)}
                        className="add-button"
                      >
                        Add to Team
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!searchResults.length && addMemberSearch.length >= 2 && !searchLoading && (
                <div className="no-results">
                  <p>No existing users found. Create a new user:</p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                    const role = (e.currentTarget.elements.namedItem('role') as HTMLSelectElement).value;
                    handleAddMember(email, role as 'CLINICIAN' | 'CAREGIVER');
                  }}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      required
                    />
                    <select name="role" required>
                      <option value="">Select role</option>
                      <option value="CLINICIAN">Clinician</option>
                      <option value="CAREGIVER">Caregiver</option>
                    </select>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowAddMember(false)}>Cancel</button>
                      <button type="submit">Add New Member</button>
                    </div>
                  </form>
                </div>
              )}

              {(!addMemberSearch || addMemberSearch.length < 2) && (
                <p className="search-hint">Start typing to search for existing users...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement; 