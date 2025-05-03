import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import './KidProfileHome.css';
import { AssessmentHistory } from './AssessmentHistory';
import PromptGame from './PromptGame';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  CalendarIcon, 
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon,
  SparklesIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import styled from 'styled-components';

const client = generateClient<Schema>();

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #EDF2F7 0%, #F7FAFC 100%);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background-color: #FFFFFF;
  border-radius: 24px;
  box-shadow: 
    0 4px 6px rgba(31, 41, 55, 0.04),
    0 12px 16px rgba(31, 41, 55, 0.06);
  position: relative;
  overflow: hidden;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #60A5FA 0%, #34D399 100%);
  }
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 2.75rem;
    color: #1E293B;
    margin: 0;
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(90deg, #1E293B 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #64748B;
    margin: 0.75rem 0 0;
    font-size: 1.25rem;
    font-weight: 400;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${props => props.variant === 'primary' ? '1rem 2rem' : '0.875rem 1.5rem'};
  border: none;
  border-radius: 16px;
  background: ${props => props.variant === 'primary' ? 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)' : '#F8FAFC'};
  color: ${props => props.variant === 'primary' ? 'white' : '#1E293B'};
  font-weight: 600;
  font-size: ${props => props.variant === 'primary' ? '1.125rem' : '1rem'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.variant === 'primary' 
    ? '0 4px 6px rgba(49, 151, 149, 0.1), 0 2px 4px rgba(49, 151, 149, 0.06)'
    : '0 2px 4px rgba(0, 0, 0, 0.05)'};

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.variant === 'primary' 
      ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
      : '#F1F5F9'};
    box-shadow: ${props => props.variant === 'primary'
      ? '0 6px 12px rgba(49, 151, 149, 0.15), 0 4px 6px rgba(49, 151, 149, 0.1)'
      : '0 4px 6px rgba(0, 0, 0, 0.08)'};
  }

  svg {
    width: ${props => props.variant === 'primary' ? '24px' : '20px'};
    height: ${props => props.variant === 'primary' ? '24px' : '20px'};
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  position: relative;
  margin-top: 1rem;
`;

const MainContent = styled.div`
  grid-column: span 8;
  display: grid;
  gap: 2rem;
`;

const Sidebar = styled.div`
  grid-column: span 4;
  display: grid;
  gap: 2rem;
  height: fit-content;

  /* Remove position sticky and max-height to allow both cards to be visible */
  /* position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem); */
  
  /* Make scrolling smooth if needed */
  overflow-y: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const Card = styled.div<{ variant?: 'featured' | 'default' }>`
  background: white;
  border-radius: 24px;
  padding: ${props => props.variant === 'featured' ? '2rem' : '1.75rem'};
  box-shadow: 
    0 4px 6px rgba(31, 41, 55, 0.04),
    0 12px 16px rgba(31, 41, 55, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(31, 41, 55, 0.06),
      0 16px 24px rgba(31, 41, 55, 0.08);
  }
`;

const FeaturedCard = styled(Card)`
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  padding: 2.5rem;
  margin-bottom: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #60A5FA 0%, #34D399 100%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%);
    border-radius: 100%;
    transform: translate(30%, 30%);
    z-index: 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;

  h2 {
    font-size: 1.875rem;
    color: #1E293B;
    margin: 0;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: -1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(31, 41, 55, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.8);

  h3 {
    font-size: 2.5rem;
    color: #1E293B;
    margin: 0;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    margin: 0.5rem 0 0;
    color: #64748B;
    font-size: 1rem;
    font-weight: 500;
  }
`;

const TeamMember = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border-radius: 16px;
  transition: all 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #F8FAFC;
    transform: translateX(4px);
    box-shadow: 0 4px 6px rgba(31, 41, 55, 0.04);
  }
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  box-shadow: 0 4px 6px rgba(31, 41, 55, 0.1);
`;

const GameCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(31, 41, 55, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.8);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(31, 41, 55, 0.1);
  }

  .game-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }

  h3 {
    font-size: 1.25rem;
    color: #1E293B;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  }

  p {
    color: #64748B;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
`;

interface KidProfile {
  id: string;
  name: string;
  age: number | null;
  dob: string;
  parentId: string;
  isAutismDiagnosed: boolean;
  isDummy: boolean;
}

interface UserProfile {
  id: string;
  fName: string;
  lName: string;
}

interface MilestoneTask {
  id: string;
  title: string;
  type: 'MILESTONE' | 'TASK';
  parentId?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  parentFriendlyDescription?: string;
  strategies?: string;
  developmentalOverview?: string;
  kidProfileId: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: MilestoneTask[];
  aha_moment?: string;
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMilestoneLoading, setIsMilestoneLoading] = useState(false);
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

  // Load initial data
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

  // Effect to fetch milestones when URL parameter changes
  useEffect(() => {
    if (kidProfileId) {
      const fetchLatestMilestones = async () => {
        setIsMilestoneLoading(true);
        try {
          await fetchCurrentMilestone();
        } catch (error) {
          console.error('Error fetching latest milestones:', error);
        } finally {
          setIsMilestoneLoading(false);
        }
      };
      fetchLatestMilestones();
    }
  }, [kidProfileId, searchParams.get('t')]);

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
        const currentUser = await getCurrentUser();
        if (currentUser?.userId) {
          const { data: userData } = await client.models.User.get({ id: currentUser.userId });
          if (userData?.fName) {
            setUserProfile({
              id: userData.id || '',
              fName: userData.fName,
              lName: userData.lName || ''
            });
          }
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
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
      setIsMilestoneLoading(true);
      console.log('Fetching current milestone for kid profile:', kidProfileId);
      
      const milestoneResponse = await client.models.MilestoneTask.list({
        filter: {
          kidProfileId: { eq: kidProfileId },
          type: { eq: 'MILESTONE' }
        }
      });

      if (milestoneResponse?.data?.[0]) {
        const milestone = milestoneResponse.data[0];
        
        if (!milestone.id) {
          console.error('Milestone ID is missing');
          return;
        }

        const { data: tasks } = await client.models.MilestoneTask.list({
          filter: {
            kidProfileId: { eq: kidProfileId },
            type: { eq: 'TASK' },
            parentId: { eq: milestone.id }
          }
        });

        // Filter and transform tasks
        const validTasks = (tasks || [])
          .filter((task): task is NonNullable<typeof task> => 
            task !== null && 
            task.id !== null && 
            task.id !== '' &&
            typeof task.kidProfileId === 'string' &&
            task.type === 'TASK'
          )
          .map(task => {
            if (!task.id) return null; // TypeScript guard
            
            const milestoneTask: MilestoneTask = {
              id: task.id,
              title: task.title || '',
              type: 'TASK',
              parentId: task.parentId || undefined,
              status: task.status || 'NOT_STARTED',
              parentFriendlyDescription: task.parentFriendlyDescription || undefined,
              strategies: task.strategies || undefined,
              developmentalOverview: task.developmentalOverview || undefined,
              kidProfileId: task.kidProfileId
            };
            return milestoneTask;
          })
          .filter((task): task is MilestoneTask => task !== null);

        setCurrentMilestone({
          id: milestone.id,
          title: milestone.title || '',
          description: milestone.developmentalOverview || '',
          tasks: validTasks,
          aha_moment: milestone.developmentalOverview || undefined
        });

        console.log('Current milestone and tasks:', {
          milestone: milestone,
          tasks: validTasks
        });
      } else {
        console.log('No milestone found for kid profile');
        setCurrentMilestone(null);
      }
    } catch (error) {
      console.error('Error fetching current milestone:', error);
      setCurrentMilestone(null);
    } finally {
      setIsMilestoneLoading(false);
    }
  };

  const handleManageTeam = () => {
    setIsManageTeamLoading(true);
    navigate(`/team-management/${kidProfileId}`);
  };

  const handleAssessmentComplete = () => {
    // Refresh logic
  };

  const renderMilestoneContent = () => {
    if (isLoading || isMilestoneLoading) {
      return (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading milestone data...</p>
        </div>
      );
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
      <div className="milestone-content">
        {currentMilestone.description && (
          <div className="overview-section">
            <h4 className="section-title">Developmental Overview</h4>
            <p className="overview-text">{currentMilestone.description}</p>
          </div>
        )}

        <div className="tasks-list">
          {currentMilestone.tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h5 className="task-title">{task.title || 'Untitled Task'}</h5>
                <span className="status-badge pending">{task.status}</span>
              </div>
              {task.parentFriendlyDescription && (
                <p className="task-description">{task.parentFriendlyDescription}</p>
              )}
              {task.strategies && (
                <div className="task-strategy">
                  <h6 className="strategy-title">Home Strategy:</h6>
                  <p className="strategy-text">{task.strategies}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
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
    return <AssessmentHistory 
      kidProfileId={kidProfileId} 
      onClose={() => setShowHistory(false)} 
      displayFormat="qa"
      onRefresh={handleAssessmentComplete}
    />;
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Welcome back, {userProfile ? userProfile.fName : 'Parent'}</h1>
          <p>Track your child's developmental journey</p>
        </HeaderContent>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton 
            variant="primary" 
            onClick={() => navigate(`/parent-concerns/${kidProfileId}`)}
          >
            <ChartBarIcon />
            Take Assessment
          </ActionButton>
          <ActionButton onClick={() => setShowHistory(true)}>
            <CalendarIcon />
            View History
          </ActionButton>
        </div>
      </Header>

      <DashboardGrid>
        <MainContent>
          <FeaturedCard variant="featured">
            <CardHeader>
              <h2>Current Milestone</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <ActionButton 
                  onClick={() => navigate(`/milestone-tasks/${kidProfileId}`)}
                  style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }}
                >
                  View All Milestones
                  <ChevronRightIcon style={{ width: 20, height: 20 }} />
                </ActionButton>
                <StarIcon style={{ color: '#60A5FA', width: 32, height: 32 }} />
              </div>
            </CardHeader>

            <StatsGrid>
              <StatCard>
                <h3>{currentMilestone?.tasks?.length || 0}</h3>
                <p>Total Tasks</p>
              </StatCard>
              <StatCard>
                <h3>{currentMilestone?.tasks?.length ? 
                  Math.round((currentMilestone.tasks.filter(task => task.status === 'COMPLETED').length / 
                  currentMilestone.tasks.length) * 100) : 0}%</h3>
                <p>Tasks Completed</p>
              </StatCard>
              <StatCard>
                <h3>{teamMembers.filter(member => member.status === 'ACTIVE').length}</h3>
                <p>Active Team Members</p>
              </StatCard>
            </StatsGrid>

            {renderMilestoneContent()}
          </FeaturedCard>

          <Card>
            <CardHeader>
              <h2>Recent Activities</h2>
            </CardHeader>
            {renderProgressSection()}
          </Card>
        </MainContent>

        <Sidebar>
          <Card>
            <CardHeader>
              <h2>Support Team</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <ActionButton 
                  onClick={handleManageTeam}
                  style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }}
                >
                  Manage Team
                </ActionButton>
                <UserGroupIcon style={{ color: '#60A5FA', width: 28, height: 28 }} />
              </div>
            </CardHeader>
            {teamMembers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 2rem', 
                color: '#64748B',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                borderRadius: '16px',
                marginTop: '1rem'
              }}>
                <UserGroupIcon style={{ 
                  width: 64, 
                  height: 64, 
                  marginBottom: '1.5rem', 
                  color: '#94A3B8' 
                }} />
                <p style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>Build Your Support Network</p>
                <p style={{ 
                  fontSize: '0.9375rem',
                  color: '#64748B',
                  maxWidth: '80%',
                  margin: '0 auto'
                }}>Add team members to collaborate on your child's journey</p>
              </div>
            ) :
              teamMembers.map(member => (
                <TeamMember key={member.id}>
                  <Avatar>{member.name.charAt(0)}</Avatar>
                  <div>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '1.125rem', 
                      color: '#1E293B',
                      fontWeight: '600'
                    }}>{member.name}</h4>
                    <p style={{ 
                      margin: '0.375rem 0 0', 
                      color: '#64748B', 
                      fontSize: '0.9375rem'
                    }}>
                      {member.role}
                    </p>
                  </div>
                </TeamMember>
              ))
            }
          </Card>

          <GameCard onClick={() => navigate('/games')}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div className="game-icon">
                <SparklesIcon style={{ color: 'white', width: 28, height: 28 }} />
              </div>
              <h3>Interactive Games</h3>
              <p>Play fun learning games to develop skills</p>
            </div>
          </GameCard>
        </Sidebar>
      </DashboardGrid>
    </Container>
  );
} 