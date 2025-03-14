import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useNavigate, useParams } from 'react-router-dom';
import type { Schema } from '../../amplify/data/resource';
import './TeamManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserPlus, faTrash, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { TeamRequestsManagement } from './TeamRequestsManagement';

const client = generateClient<Schema>();

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  userId: string;
  teamId: string;
  email: string | null;
}

// Available healthcare professionals that can be added to the team
const availableMembers = [
  { id: '4', name: 'Dr. James Wilson', role: 'Child Psychologist' },
  { id: '5', name: 'Lisa Thompson', role: 'Physical Therapist' },
  { id: '6', name: 'Dr. Maria Garcia', role: 'Pediatric Neurologist' },
  { id: '7', name: 'Robert Kim', role: 'Behavioral Therapist' },
  { id: '8', name: 'Dr. Amanda Lee', role: 'Developmental Specialist' },
  { id: '9', name: 'David Chen', role: 'Music Therapist' }
];

export function TeamManagement() {
  const { kidProfileId } = useParams();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvailableMembers, setShowAvailableMembers] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeamMembers, setFilteredTeamMembers] = useState<TeamMember[]>([]);
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (kidProfileId) {
      fetchTeam();
    }
  }, [kidProfileId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeamMembers(teamMembers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = teamMembers.filter(member => 
        member.name.toLowerCase().includes(query) ||
        (member.email?.toLowerCase() || '').includes(query) ||
        member.role.toLowerCase().includes(query)
      );
      setFilteredTeamMembers(filtered);
    }
  }, [searchQuery, teamMembers]);

  const fetchTeam = async () => {
    try {
      const response = await client.models.Team.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      if (response?.data?.[0]) {
        const teamData = response.data[0];
        if (teamData.id && teamData.name) {
          setTeam({
            id: teamData.id,
            name: teamData.name
          });
        } else {
          setError('Invalid team data');
        }
      } else {
        setError('Team not found');
      }
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Failed to load team information');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamAndMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching team for kidProfileId:', kidProfileId);

      // First, get the team associated with this kid profile
      const teamsResponse = await client.models.Team.list({
        filter: {
          kidProfileId: {
            eq: kidProfileId
          }
        }
      });

      console.log('Teams response:', teamsResponse);

      let team = teamsResponse?.data?.[0];
      if (!team?.id) {
        console.log('No team found, creating new team...');
        // Create a new team if none exists
        const createTeamResponse = await client.models.Team.create({
          kidProfileId: kidProfileId,
          name: 'Support Team',
          adminId: 'system' // You might want to set this to the current user's ID
        });
        
        if (!createTeamResponse?.data?.id) {
          throw new Error('Failed to create team');
        }
        team = createTeamResponse.data;
        console.log('New team created:', team);
      }

      setTeamId(team.id);

      // Then fetch all team members for this team
      console.log('Fetching team members for teamId:', team.id);
      const teamMembersResponse = await client.models.TeamMember.list({
        filter: {
          teamId: {
            eq: team.id || undefined
          }
        }
      });

      console.log('Team members response:', teamMembersResponse);

      if (teamMembersResponse?.data) {
        const members = await Promise.all(
          teamMembersResponse.data.map(async (member) => {
            if (!member.id || !member.userId || !member.teamId) {
              console.log('Invalid member data:', member);
              return null;
            }

            // Fetch the associated user details
            const userResponse = await client.models.User.get({
              id: member.userId
            });

            console.log('User details for member:', userResponse);

            if (!userResponse?.data?.fName) {
              console.log('Invalid user data:', userResponse);
              return null;
            }
            
            return {
              id: member.id,
              name: `${userResponse.data.fName} ${userResponse.data.lName || ''}`,
              role: userResponse.data.role || 'MEMBER',
              status: member.status as 'ACTIVE' | 'PENDING' | 'INACTIVE',
              userId: member.userId,
              teamId: member.teamId,
              email: userResponse.data.email
            };
          })
        );

        const validMembers = members.filter((member): member is TeamMember => member !== null);
        console.log('Valid team members:', validMembers);
        setTeamMembers(validMembers);
        setFilteredTeamMembers(validMembers);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (newMember: typeof availableMembers[0]) => {
    if (!kidProfileId || !teamId) {
      console.error('Missing kidProfileId or teamId');
      setError('Cannot add member: missing required information');
      return;
    }

    try {
      setError(null);
      console.log('Creating new user for:', newMember);

      // First create a new user with all required fields
      const userResponse = await client.models.User.create({
        username: newMember.name.toLowerCase().replace(/\s/g, '.'),
        fName: newMember.name.split(' ')[0],
        lName: newMember.name.split(' ')[1] || '',
        email: `${newMember.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
        role: 'CLINICIAN' as const,
        status: 'ACTIVE' as const,
        password: 'temporary123',
        phoneNumber: '+1234567890', // Required field with valid format
        address: 'Default Address',  // Required field with non-empty value
        dob: new Date().toISOString().split('T')[0], // Required field in YYYY-MM-DD format
        mName: '-' // Required field with non-empty value
      });

      console.log('User creation response:', userResponse);

      if (!userResponse?.data?.id) {
        throw new Error('Failed to create user');
      }

      console.log('Creating team member with:', {
        teamId,
        userId: userResponse.data.id
      });

      // Create the team member with all required fields
      const teamMemberResponse = await client.models.TeamMember.create({
        teamId: teamId,
        userId: userResponse.data.id,
        role: 'MEMBER' as const,
        status: 'ACTIVE' as const,
        invitedBy: userResponse.data.email || 'system',
        invitedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString()
      });

      console.log('Team member creation response:', teamMemberResponse);

      if (!teamMemberResponse?.data?.id) {
        // If team member creation fails, clean up the user
        try {
          await client.models.User.delete({
            id: userResponse.data.id
          });
        } catch (cleanupErr) {
          console.error('Failed to clean up user after team member creation failed:', cleanupErr);
        }
        throw new Error('Failed to add team member');
      }

      // Add the new member to the local state
      const newTeamMember: TeamMember = {
        id: teamMemberResponse.data.id,
        name: newMember.name,
        role: newMember.role,
        status: 'ACTIVE',
        userId: userResponse.data.id,
        teamId: teamId,
        email: userResponse.data.email
      };

      console.log('Adding new team member to state:', newTeamMember);
      setTeamMembers([...teamMembers, newTeamMember]);
      setFilteredTeamMembers([...filteredTeamMembers, newTeamMember]);
      setShowAvailableMembers(false);

      // Refresh the team members list to ensure we have the latest data
      await fetchTeamAndMembers();
    } catch (err) {
      console.error('Error adding team member:', err);
      if (err instanceof Error) {
        setError(`Failed to add team member: ${err.message}`);
      } else {
        setError('Failed to add team member: Unknown error');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await client.models.TeamMember.delete({
        id: memberId
      });
      
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      setFilteredTeamMembers(filteredTeamMembers.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error removing team member:', err);
      setError('Failed to remove team member');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getAvailableMembersToAdd = () => {
    return availableMembers.filter(
      available => !teamMembers.some(member => member.name === available.name)
    );
  };

  if (isLoading) {
    return <div className="loading">Loading team information...</div>;
  }

  if (error || !team) {
    return <div className="error">{error || 'Team not found'}</div>;
  }

  return (
    <div className="team-management">
      <h1>{team.name}</h1>
      <div className="team-sections">
        <section className="team-requests-section">
          <TeamRequestsManagement teamId={team.id} />
        </section>
        <section className="team-members-section">
          <div className="team-management-container">
            <div className="team-management-header">
              <button className="back-button" onClick={handleBack}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>
              <h2>Manage Team Members</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="add-member-section">
              <h3>Add New Team Member</h3>
              <button 
                className="add-button"
                onClick={() => setShowAvailableMembers(!showAvailableMembers)}
              >
                <FontAwesomeIcon icon={faUserPlus} /> Add Team Member
              </button>
              
              {showAvailableMembers && (
                <>
                  <div style={{ marginBottom: '15px', marginTop: '15px' }}>
                    <div className="search-bar" style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '500px'
                    }}>
                      <FontAwesomeIcon 
                        icon={faSearch} 
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#666'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search available members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 40px',
                          borderRadius: '6px',
                          border: '2px solid #ddd',
                          fontSize: '14px',
                          transition: 'border-color 0.2s'
                        }}
                      />
                    </div>
                  </div>
                  <div className="available-members-grid">
                    {getAvailableMembersToAdd()
                      .filter(member => 
                        !searchQuery.trim() || 
                        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        member.role.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((member) => (
                        <div key={member.id} className="available-member-card">
                          <div className="member-info">
                            <div className="member-name">{member.name}</div>
                            <div className="member-role">{member.role}</div>
                          </div>
                          <button
                            className="add-member-button"
                            onClick={() => handleAddMember(member)}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>

            <div className="team-members-list">
              <h3>Current Team Members</h3>
              {isLoading ? (
                <div className="loading">Loading team members...</div>
              ) : (
                <div className="members-grid">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="member-card">
                      <div className="member-avatar">
                        <div className="avatar-placeholder">{member.name[0]}</div>
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className={`member-status ${member.status.toLowerCase()}`}>
                          {member.status}
                        </div>
                      </div>
                      <button
                        className="remove-button"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 