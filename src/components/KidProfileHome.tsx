import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import './KidProfileHome.css';
import { AssessmentHistory } from './AssessmentHistory';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CalendarIcon, 
  PuzzlePieceIcon, 
  ChatBubbleBottomCenterTextIcon,
  TrophyIcon,
  AcademicCapIcon,
  SparklesIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

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
  const [isManageTeamLoading, setIsManageTeamLoading] = useState(false);

  // Reset states when kidProfileId changes
  useEffect(() => {
    setProfile(null);
    setCurrentMilestone(null);
    setTeamMembers([]);
    setError(null);
    setIsLoading(true);
  }, [kidProfileId]);

  useEffect(() => {
    const initializeData = async () => {
      if (kidProfileId) {
        await loadData();
      } else {
        await loadFirstKidProfile();
      }
    };

    initializeData();
  }, [kidProfileId]);

  const loadFirstKidProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      if (!currentUser?.userId) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching kid profiles for user:', currentUser.userId);
      const kidProfiles = await client.models.KidProfile.list({
        filter: {
          parentId: {
            eq: currentUser.userId
          }
        }
      });

      console.log('Kid profiles response:', kidProfiles);

      if (kidProfiles.data && kidProfiles.data.length > 0 && kidProfiles.data[0].id) {
        console.log('Navigating to kid profile:', kidProfiles.data[0].id);
        navigate(`/kid-profile/${kidProfiles.data[0].id}`, { replace: true });
      } else {
        console.log('No kid profiles found, navigating to form');
        navigate('/kid-profile-form', { replace: true });
      }
    } catch (err) {
      console.error('Error loading first kid profile:', err);
      setError('Failed to load profile data. Please try again.');
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    if (!kidProfileId) {
      console.log('No kid profile ID provided');
      setError('No kid profile ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting to load data for kidProfileId:', kidProfileId);

      // Load each piece of data separately to identify which one fails
      try {
        await fetchKidProfile();
        console.log('Kid profile loaded successfully');
      } catch (err) {
        console.error('Error loading kid profile:', err);
        throw new Error('Failed to load kid profile data');
      }

      try {
        await fetchTeamMembers();
        console.log('Team members loaded successfully');
      } catch (err) {
        console.error('Error loading team members:', err);
        // Don't throw here, just log the error
      }

      try {
        await fetchCurrentMilestone();
        console.log('Current milestone loaded successfully');
      } catch (err) {
        console.error('Error loading current milestone:', err);
        // Don't throw here, just log the error
      }

    } catch (err) {
      console.error('Error in loadData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKidProfile = async () => {
    if (!kidProfileId) {
      throw new Error('No kid profile ID provided');
    }

    console.log('Fetching kid profile for ID:', kidProfileId);
    const response = await client.models.KidProfile.get({ id: kidProfileId });
    const data = response?.data;
    
    if (!data) {
      console.error('No data received from server for kid profile:', kidProfileId);
      throw new Error('No data received from server');
    }

    if (!data.id || !data.name || !data.dob || !data.parentId) {
      console.error('Invalid kid profile data:', data);
      throw new Error('Invalid kid profile data: missing required fields');
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
    console.log('Kid profile data processed:', kidProfile);
    setProfile(kidProfile);
  };

  const fetchTeamMembers = async () => {
    if (!kidProfileId) {
      console.log('No kid profile ID, skipping team members fetch');
      return;
    }
    
    try {
      console.log('Fetching team members for kid profile:', kidProfileId);
      const teamResponse = await client.models.Team.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      const team = teamResponse?.data?.[0];
      if (!team) {
        console.log('No team found for kid profile');
        setTeamMembers([]);
        return;
      }

      if (Array.isArray(team.members)) {
        const membersList = team.members as Array<{
          id?: string;
          name?: string;
          role?: string;
          status?: string;
          imageUrl?: string;
        }>;
        
        const processedMembers = membersList.map(member => ({
          id: member.id || '',
          name: member.name || '',
          role: member.role || 'MEMBER',
          status: (member.status as 'ACTIVE' | 'PENDING' | 'INACTIVE') || 'PENDING',
          imageUrl: member.imageUrl
        }));
        
        console.log('Team members processed:', processedMembers);
        setTeamMembers(processedMembers);
      } else {
        console.log('No members array in team data');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    }
  };

  const fetchCurrentMilestone = async () => {
    if (!kidProfileId) {
      console.log('No kid profile ID, skipping milestone fetch');
      return;
    }
    
    try {
      console.log('Fetching current milestone for kid profile:', kidProfileId);
      const milestoneResponse = await client.models.Milestone.list({
        filter: {
          kidProfileId: { eq: kidProfileId }
        }
      });

      if (milestoneResponse?.data?.[0]) {
        const milestone = milestoneResponse.data[0];
        const processedMilestone = {
          id: milestone.id || '',
          title: milestone.title || '',
          description: milestone.description || '',
          tasks: Array.isArray(milestone.tasks) ? milestone.tasks.map(task => ({
            id: task.id || '',
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'pending'
          })) : []
        };
        
        console.log('Current milestone processed:', processedMilestone);
        setCurrentMilestone(processedMilestone);
      } else {
        console.log('No milestone found for kid profile');
        setCurrentMilestone(null);
      }
    } catch (error) {
      console.error('Error fetching current milestone:', error);
      setCurrentMilestone(null);
    }
  };

  const handleManageTeam = () => {
    setIsManageTeamLoading(true);
    navigate(`/team-management/${kidProfileId}`);
  };

  const renderMilestoneContent = () => {
    if (isLoading) {
      return <div className="loading">Loading milestone data...</div>;
    }

    if (!currentMilestone) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AcademicCapIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h3>Let's Start Your Journey!</h3>
          <p>Take an assessment to get personalized milestones and tasks tailored for {profile?.name}'s development.</p>
          <div className="empty-state-actions">
            <button 
              className="primary-button"
              onClick={() => navigate(`/parent-concerns/${kidProfileId}`)}
            >
              Take Initial Assessment
            </button>
          </div>
        </div>
      );
    }

    return (
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
    );
  };

  const renderProgressSection = () => {
    return (
      <div className="progress-section">
        <div className="card-header">
          <h3>Overall Progress</h3>
        </div>
        <div className="development-areas">
          <div className="development-area">
            <div className="area-header">
              <span className="area-icon">
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-blue-600" />
              </span>
              <h4>Communication</h4>
            </div>
            <div className="progress-bar">
              <div className="progress-placeholder"></div>
            </div>
          </div>
          <div className="development-area">
            <div className="area-header">
              <span className="area-icon">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </span>
              <h4>Social Skills</h4>
            </div>
            <div className="progress-bar">
              <div className="progress-placeholder"></div>
            </div>
          </div>
          <div className="development-area">
            <div className="area-header">
              <span className="area-icon">
                <HomeIcon className="h-6 w-6 text-blue-600" />
              </span>
              <h4>Daily Living</h4>
            </div>
            <div className="progress-bar">
              <div className="progress-placeholder"></div>
            </div>
          </div>
        </div>
        <p className="progress-note">Progress tracking will begin after your first assessment</p>
      </div>
    );
  };

  if (isManageTeamLoading) {
    return (
      <div className="loading">
        <div className="loading-text">Loading team management...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-text">Loading profile data...</div>
      </div>
    );
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
            <h2>Welcome back{profile ? `, ${profile.name}` : ''}</h2>
            <p>Let's start tracking development progress</p>
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

        <table className="main-content">
          <tbody>
            <tr>
              <td className="left-column">
                <div className="milestone-card">
                  <div className="card-header">
                    <h3>Current Milestone</h3>
                    <span className="trophy-icon">
                      <TrophyIcon className="h-6 w-6 text-blue-600" />
                    </span>
                  </div>
                  {renderMilestoneContent()}
                </div>
                {renderProgressSection()}
              </td>
              <td className="right-column">
                <div className="team-section">
                  <div className="card-header">
                    <h3>{profile.name}'s Support Team</h3>
                  </div>
                  <div className="team-members">
                    {teamMembers.length === 0 ? (
                      <div className="empty-team">
                        <UserGroupIcon className="h-12 w-12 text-gray-400" />
                        <p>Add team members to collaborate</p>
                      </div>
                    ) : (
                      teamMembers.map(member => (
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
                      ))
                    )}
                  </div>
                  <button 
                    className="manage-team-button" 
                    onClick={handleManageTeam}
                    disabled={isManageTeamLoading}
                  >
                    Manage Team
                  </button>
                </div>

                <div className="resources-section">
                  <div className="card-header">
                    <h3>Resources</h3>
                    <button 
                      className="view-all-button"
                      onClick={() => navigate('/resources')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="resources-grid">
                    <div className="resource-card" onClick={() => navigate('/resources/visual-schedules')}>
                      <div className="resource-icon">
                        <CalendarIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4>Visual Schedules</h4>
                      <p>Create and use visual schedules to help with daily routines</p>
                    </div>
                    <div className="resource-card" onClick={() => navigate('/resources/sensory-activities')}>
                      <div className="resource-icon">
                        <PuzzlePieceIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4>Sensory Activities</h4>
                      <p>Fun activities to support sensory development</p>
                    </div>
                    <div className="resource-card" onClick={() => navigate('/resources/communication-tools')}>
                      <div className="resource-icon">
                        <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4>Communication Tools</h4>
                      <p>Tools and strategies to enhance communication</p>
                    </div>
                  </div>
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {showHistory && (
        <AssessmentHistory
          kidProfileId={kidProfileId || ''}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
} 