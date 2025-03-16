import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import './KidProfileHome.css';
import { AssessmentHistory } from './AssessmentHistory';
import { useNavigate, useParams } from 'react-router-dom';

const client = generateClient<Schema>();

interface KidProfile {
  id: string;
  name: string;
  age: number | null;
  dob: string;
  parentId: string;
  isAutismDiagnosed: boolean;
  isDummy: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'in-progress' | 'pending' | 'completed';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

export function KidProfileHome() {
  const { kidProfileId } = useParams<{ kidProfileId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (kidProfileId) {
      loadData();
    } else {
      loadFirstKidProfile();
    }
  }, [kidProfileId]);

  const loadFirstKidProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      if (!currentUser?.userId) {
        throw new Error('User not authenticated');
      }

      const kidProfiles = await client.models.KidProfile.list({
        filter: {
          parentId: {
            eq: currentUser.userId
          }
        }
      });

      if (kidProfiles.data && kidProfiles.data.length > 0 && kidProfiles.data[0].id) {
        navigate(`/kid-profile/${kidProfiles.data[0].id}`);
      } else {
        navigate('/kid-profile-form');
      }
    } catch (err) {
      console.error('Error loading first kid profile:', err);
      setError('Failed to load profile data. Please try again.');
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await Promise.all([
        fetchKidProfile(),
        fetchTeamMembers(),
        fetchCurrentMilestone()
      ]);
    } catch (err) {
      console.error('Error loading kid profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKidProfile = async () => {
    if (!kidProfileId) return;

    const response = await client.models.KidProfile.get({ id: kidProfileId });
    const data = response?.data;
    
    if (!data || !data.id || !data.name || !data.dob || !data.parentId) {
      throw new Error('Invalid kid profile data');
    }

    const kidProfile: KidProfile = {
      id: data.id,
      name: data.name,
      age: data.age ?? null,
      dob: data.dob,
      parentId: data.parentId,
      isAutismDiagnosed: data.isAutismDiagnosed ?? false,
      isDummy: data.isDummy ?? false
    };
    setProfile(kidProfile);
  };

  const fetchTeamMembers = async () => {
    if (!kidProfileId) return;
    
    try {
      const teamResponse = await client.models.Team.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      const team = teamResponse?.data?.[0];
      if (team && Array.isArray(team.members)) {
        const membersList = team.members as Array<{
          id?: string;
          name?: string;
          role?: string;
          status?: string;
          imageUrl?: string;
        }>;
        
        setTeamMembers(
          membersList.map(member => ({
            id: member.id || '',
            name: member.name || '',
            role: member.role || 'MEMBER',
            status: (member.status as 'ACTIVE' | 'PENDING' | 'INACTIVE') || 'PENDING',
            imageUrl: member.imageUrl
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchCurrentMilestone = async () => {
    if (!kidProfileId) return;
    
    try {
      const milestoneResponse = await client.models.Milestone.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      if (milestoneResponse?.data?.[0]) {
        const milestone = milestoneResponse.data[0];
        setCurrentMilestone({
          id: milestone.id || '',
          title: milestone.title || '',
          description: milestone.description || '',
          tasks: Array.isArray(milestone.tasks) ? milestone.tasks.map(task => ({
            id: task.id || '',
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'pending'
          })) : []
        });
      }
    } catch (error) {
      console.error('Error fetching current milestone:', error);
    }
  };

  const handleManageTeam = () => {
    navigate(`/team-management/${kidProfileId}`);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  if (showHistory && kidProfileId) {
    return <AssessmentHistory kidProfileId={kidProfileId} onClose={() => setShowHistory(false)} displayFormat="qa" />;
  }

  return (
    <div className="kid-profile-home">
      <div className="content-wrapper">
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome back, {profile.name?.split(' ')[0]}</h2>
            <p>Here's how {profile.name} is progressing today</p>
          </div>
          <div className="action-buttons">
            <button 
              className="primary-button" 
              onClick={() => navigate(`/parent-concerns/${kidProfileId}`)}
            >
              Take Assessment
            </button>
            <button 
              className="secondary-button" 
              onClick={() => setShowHistory(true)}
            >
              View Past Assessments
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="left-column">
            <div className="milestone-card">
              <div className="card-header">
                <h3>Current Milestone</h3>
                <span className="trophy-icon">🏆</span>
              </div>
              {currentMilestone ? (
                <>
                  <h4>{currentMilestone.title}</h4>
                  <p>{currentMilestone.description}</p>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '65%' }}></div>
                  </div>
                  <div className="tasks-section">
                    <h4>Current Tasks</h4>
                    {currentMilestone.tasks.map(task => (
                      <div key={task.id} className="task-item">
                        <h5>{task.title}</h5>
                        <p>{task.description}</p>
                        <span className={`status ${task.status}`}>{task.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>No milestone data available</p>
              )}
            </div>

            <div className="progress-section">
              <h3>Overall Progress</h3>
              <div className="progress-bar">
                <div className="progress" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="team-section">
              <h3>{profile.name}'s Support Team</h3>
              <div className="team-members">
                {teamMembers.map(member => (
                  <div key={member.id} className="team-member">
                    <div className="member-avatar">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} />
                      ) : (
                        <div className="avatar-placeholder">{member.name[0]}</div>
                      )}
                    </div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p>{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="manage-team-button" onClick={handleManageTeam}>
                Manage Team
              </button>
            </div>

            <div className="community-section">
              <h3>Community Insights</h3>
              <div className="insight-card">
                <h4>Visual Schedule Success</h4>
                <p>Using a visual schedule during morning routine helped reduce anxiety and improved transitions.</p>
                <div className="insight-meta">
                  <span>24 👍</span>
                  <span>about 1 hour ago</span>
                  <span>by Emily K.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 