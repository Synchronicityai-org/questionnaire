import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import './Dashboard.css';

interface KidProfile {
  id: string;
  name: string;
  age: number;
  dob: string;
  isAutismDiagnosed: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  feedback?: string[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

const Dashboard: React.FC = () => {
  const { kidProfileId } = useParams<{ kidProfileId: string }>();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [kidProfile, setKidProfile] = useState<KidProfile | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = generateClient<Schema>();
        const currentUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();

        if (!currentUser?.userId) {
          throw new Error('User not authenticated');
        }

        // Set user name
        setUserName(userAttributes.name || 'User');

        // Fetch kid profile
        const profileResponse = await client.models.KidProfile.get({
          id: kidProfileId!
        });

        if (!profileResponse.data) {
          throw new Error('Kid profile not found');
        }

        // Verify this profile belongs to the current user
        if (profileResponse.data.parentId !== currentUser.userId) {
          throw new Error('Unauthorized access');
        }

        setKidProfile(profileResponse.data as KidProfile);

        // Fetch current milestone
        const milestonesResponse = await client.models.Milestone.list({
          filter: {
            kidProfileId: { eq: kidProfileId }
          },
          limit: 1
        });

        if (milestonesResponse.data && milestonesResponse.data.length > 0) {
          const milestone = milestonesResponse.data[0];
          const tasksResponse = await client.models.Task.list({
            filter: {
              milestoneId: { eq: milestone.id || '' }
            }
          });

          setCurrentMilestone({
            id: milestone.id || '',
            title: milestone.title || '',
            description: milestone.description || '',
            progress: 65, // This should come from actual progress calculation
            tasks: tasksResponse.data?.map(task => ({
              id: task.id || '',
              title: task.title || '',
              description: task.description || '',
              status: 'in-progress',
              feedback: []
            })) || []
          });
        }

        // Fetch team members
        const teamResponse = await client.models.Team.list({
          filter: {
            kidProfileId: { eq: kidProfileId }
          },
          limit: 1
        });

        if (teamResponse.data && teamResponse.data.length > 0) {
          const team = teamResponse.data[0];
          if (!team?.id) {
            console.warn('Team found but has no ID');
            return;
          }

          const teamMembersResponse = await client.models.TeamMember.list({
            filter: {
              teamId: { eq: team.id }
            }
          });

          if (teamMembersResponse.data) {
            const members = await Promise.all(
              teamMembersResponse.data.map(async (member) => {
                // Skip if no userId
                if (!member?.userId) return null;
                
                try {
                  const userResponse = await client.models.User.get({ 
                    id: member.userId
                  });
                  const userData = userResponse?.data;
                  if (!userData) return null;
                  
                  return {
                    id: member.userId,
                    name: `${userData.fName ?? ''} ${userData.lName ?? ''}`.trim() || 'Unknown User',
                    role: userData.role ?? 'Team Member'
                  };
                } catch (err) {
                  console.error('Error fetching user data:', err);
                  return null;
                }
              })
            );
            setTeamMembers(members.filter((m): m is TeamMember => m !== null));
          }
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [kidProfileId]);

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error || !kidProfile) {
    return (
      <div className="dashboard error">
        <div className="error-message">
          {error || 'Could not load the dashboard'}
        </div>
        <button onClick={() => navigate('/')} className="back-button">
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {userName}</h1>
        <p className="subtitle">Here's how {kidProfile.name} is progressing today</p>
      </div>

      <div className="dashboard-content">
        <div className="current-milestone">
          <div className="section-header">
            <h2>Current Milestone</h2>
            <div className="trophy-icon">🏆</div>
          </div>
          
          {currentMilestone ? (
            <>
              <h3>{currentMilestone.title}</h3>
              <p>{currentMilestone.description}</p>
              
              <div className="progress-section">
                <label>Progress</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${currentMilestone.progress}%` }}
                  />
                </div>
                <span className="progress-text">{currentMilestone.progress}%</span>
              </div>

              <div className="tasks-section">
                <h4>Current Tasks</h4>
                {currentMilestone.tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.status}`}>
                    <h5>{task.title}</h5>
                    <p>{task.description}</p>
                    {task.feedback && task.feedback.length > 0 && (
                      <div className="feedback-section">
                        <p className="recent-feedback">
                          Recent Feedback: {task.feedback[0]}
                        </p>
                        <button className="add-feedback">Add Feedback</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No milestone set yet</p>
          )}
        </div>

        <div className="support-team">
          <div className="section-header">
            <h2>{kidProfile.name}'s Support Team</h2>
            <div className="team-icon">👥</div>
          </div>
          
          <div className="team-members">
            {teamMembers.map(member => (
              <div key={member.id} className="team-member">
                <div className="member-avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="member-info">
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="manage-team" onClick={() => navigate(`/team/${kidProfile.id}`)}>
            Manage Team
          </button>
        </div>

        <button className="update-assessment" onClick={() => navigate(`/parent-concerns/${kidProfile.id}`)}>
          Update Assessment
        </button>
      </div>
    </div>
  );
};

export default Dashboard;