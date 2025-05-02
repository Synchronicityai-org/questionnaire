import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import styled from 'styled-components';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ArrowLeftIcon,
  StarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const client = generateClient<Schema>();

interface MilestoneTask {
  id: string;
  type: 'TASK';
  title: string;
  description: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  strategies?: string;
  feedback?: string;
  effectiveness?: 'EFFECTIVE' | 'NOT_EFFECTIVE';
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  type: 'MILESTONE';
  title: string;
  description: string;
  tasks: MilestoneTask[];
  aha_moment?: string;
  createdAt: string;
  updatedAt: string;
}

interface MilestoneWithTasks extends Omit<Milestone, 'tasks'> {
  tasks: MilestoneTask[];
}

interface MilestoneTaskResponse {
  data: Array<{
    id: string | null;
    kidProfileId: string;
    title: string;
    type: 'MILESTONE' | 'TASK' | null;
    parentId?: string | null;
    developmentalOverview?: string | null;
    parentFriendlyDescription?: string | null;
    strategies?: string | null;
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | null;
    parentFeedback?: string | null;
    isEffective?: boolean | null;
    feedbackDate?: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    owner?: string | null;
  }> | null;
  nextToken?: string | null;
  errors?: any[];
}

interface KidProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #F8FAFC;
`;

const CanvasArea = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  margin-top: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 2.5rem;
    color: #2C3E50;
    margin: 0;
    font-weight: 700;
  }

  p {
    color: #64748B;
    margin: 0.5rem 0 0;
    font-size: 1.1rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: #F8F9FA;
  color: #2C3E50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #E2E8F0;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MilestoneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(300px, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, minmax(300px, 1fr));
  }
`;

const MilestoneCard = styled.div<{ isExpanded: boolean }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: ${props => props.isExpanded ? 'auto' : '100px'};
  border: 1px solid #E2E8F0;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div<{ progress: number }>`
  padding: 1.25rem;
  background: linear-gradient(135deg, #6BCB77 0%, #4A90E2 100%);
  color: white;
  position: relative;
  cursor: pointer;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    width: ${props => props.progress}%;
    background: #FFD93D;
    transition: width 0.3s ease;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;

  svg {
    width: 24px;
    height: 24px;
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
`;

const TasksContainer = styled.div<{ isExpanded: boolean }>`
  padding: ${props => props.isExpanded ? '1.25rem' : '0'};
  background: #FAFAFA;
  flex: 1;
  overflow: hidden;
  max-height: ${props => props.isExpanded ? '500px' : '0'};
  transition: all 0.3s ease;
  opacity: ${props => props.isExpanded ? '1' : '0'};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F1F5F9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 3px;
    
    &:hover {
      background: #94A3B8;
    }
  }
`;

const TaskCard = styled.div<{ status: string }>`
  background: white;
  border-radius: 8px; // Reduced border radius
  padding: 0.75rem; // Reduced padding
  margin-bottom: 0.75rem; // Reduced margin
  transition: all 0.2s ease;
  border: 1px solid ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed': return '#DCF7E3';
      case 'in_progress': return '#FFEDD5';
      default: return '#E2E8F0';
    }
  }};

  &:hover {
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: #1E293B;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed': return '#DCF7E3';
      case 'in_progress': return '#FFEDD5';
      default: return '#F1F5F9';
    }
  }};
  color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed': return '#166534';
      case 'in_progress': return '#9A3412';
      default: return '#475569';
    }
  }};
`;

const TaskDescription = styled.p`
  margin: 0.35rem 0 0; // Reduced margin
  color: #64748B;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #64748B;
  font-size: 0.875rem;

  .progress-bar {
    flex-grow: 1;
    height: 6px;
    background: #E2E8F0;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background: #6BCB77;
    border-radius: 999px;
    transition: width 0.3s ease;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #4A90E2;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #357ABD;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Helper function to get milestone icon
const getMilestoneIcon = (index: number) => {
  const icons = [StarIcon, BookOpenIcon, AcademicCapIcon, HeartIcon];
  return icons[index % icons.length];
};

// Calculate progress for a milestone
const calculateProgress = (tasks: MilestoneTask[]) => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(task => task.status === 'COMPLETED').length;
  return Math.round((completed / tasks.length) * 100);
};

const MilestoneTaskList: React.FC<{ kidProfileId: string }> = ({ kidProfileId }) => {
  const [milestones, setMilestones] = useState<MilestoneWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [kidProfile, setKidProfile] = useState<KidProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!kidProfileId) {
      setError('Kid Profile ID is required');
      return;
    }
    fetchKidProfile();
    fetchMilestoneTasks();
  }, [kidProfileId]);

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
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
    console.log('Kid profile data processed:', kidProfile);
    setKidProfile(kidProfile);
  };

  const fetchMilestoneTasks = async () => {
    try {
      console.log('Starting to fetch milestones for kidProfileId:', kidProfileId);
      setLoading(true);
      setError(null);

      // Fetch all milestones with pagination
      let allMilestoneData: any[] = [];
      let nextToken: string | null | undefined = undefined;

      do {
        console.log('Fetching milestones with nextToken:', nextToken);
        const response = await client.models.MilestoneTask.list({
          filter: {
            and: [
              { kidProfileId: { eq: kidProfileId } },
              { type: { eq: 'MILESTONE' } }
            ]
          },
          limit: 1000,
          nextToken
        }) as MilestoneTaskResponse;

        console.log('Raw milestone response:', response);
        
        if (response.data) {
          console.log('Received milestone data:', response.data);
          allMilestoneData = [...allMilestoneData, ...response.data];
        }
        nextToken = response.nextToken;
      } while (nextToken);

      console.log('Total milestones accumulated:', allMilestoneData.length);

      // Filter out any items with null IDs and map to Milestone type
      const validMilestones = allMilestoneData
        .filter(item => item.id)
        .map(item => ({
          id: item.id,
          type: 'MILESTONE' as const,
          title: item.title || '',
          description: item.description || '',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        }));

      console.log('Valid milestones after filtering:', validMilestones);

      // Fetch tasks for each milestone with pagination
      const milestonesWithTasks = await Promise.all(
        validMilestones.map(async (milestone) => {
          console.log('Fetching tasks for milestone:', milestone.id);
          let allTaskData: any[] = [];
          let taskNextToken: string | null | undefined = undefined;

          do {
            const response = await client.models.MilestoneTask.list({
              filter: {
                and: [
                  { kidProfileId: { eq: kidProfileId } },
                  { type: { eq: 'TASK' } },
                  { parentId: { eq: milestone.id } }
                ]
              },
              limit: 1000,
              nextToken: taskNextToken
            }) as MilestoneTaskResponse;

            console.log('Raw task response for milestone', milestone.id, ':', response);

            if (response.data) {
              allTaskData = [...allTaskData, ...response.data];
            }
            taskNextToken = response.nextToken;
          } while (taskNextToken);

          const tasks = allTaskData
            .filter(item => item.id)
            .map(item => ({
              id: item.id,
              type: 'TASK' as const,
              title: item.title || '',
              description: item.description || '',
              status: (item.status as MilestoneTask['status']) || 'NOT_STARTED',
              strategies: item.strategies || '',
              feedback: item.feedback || '',
              effectiveness: item.effectiveness as MilestoneTask['effectiveness'],
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString()
            }));

          console.log('Tasks for milestone', milestone.id, ':', tasks);

          return {
            ...milestone,
            tasks
          } as MilestoneWithTasks;
        })
      );

      // Sort milestones by creation date (newest first)
      const sortedMilestones = milestonesWithTasks.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log('Final milestones with tasks:', sortedMilestones);
      setMilestones(sortedMilestones);
    } catch (err) {
      console.error('Error fetching milestone tasks:', err);
      setError('Failed to load milestones. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  console.log('Current state:', { loading, error, milestonesCount: milestones.length });

  if (loading) {
    return (
      <Container>
        <div className="loading-spinner"></div>
        <p>Loading milestones...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <h2>Error</h2>
        <p>{error}</p>
        <BackButton onClick={fetchMilestoneTasks}>Try Again</BackButton>
      </Container>
    );
  }

  if (milestones.length === 0) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <h1>{kidProfile?.name}'s Developmental Milestones</h1>
            <p>Track and monitor developmental progress</p>
          </HeaderContent>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeftIcon />
            Back
          </BackButton>
        </Header>
        <div className="no-milestones">
          <p>No milestones found. Complete an assessment to generate milestones for {kidProfile?.name}.</p>
          <ActionButton onClick={() => navigate(`/questionnaire/${kidProfileId}`)}>
            Take Assessment
          </ActionButton>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>{kidProfile?.name}'s Developmental Milestones</h1>
          <p>Track and monitor developmental progress</p>
        </HeaderContent>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
          Back
        </BackButton>
      </Header>

      <CanvasArea>
        <MilestoneGrid>
          {milestones.map((milestone, index) => {
            const progress = calculateProgress(milestone.tasks);
            const Icon = getMilestoneIcon(index);
            const isExpanded = expandedMilestones.has(milestone.id);

            return (
              <MilestoneCard key={milestone.id} isExpanded={isExpanded}>
                <CardHeader 
                  progress={progress}
                  onClick={() => toggleMilestone(milestone.id)}
                >
                  <CardTitle>
                    <Icon />
                    <h3 title={milestone.title}>{milestone.title}</h3>
                  </CardTitle>
                  <CardMeta>
                    <span>Updated: {formatDate(milestone.updatedAt)}</span>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </CardMeta>
                </CardHeader>

                <TasksContainer isExpanded={isExpanded}>
                  <ProgressIndicator>
                    <span>{progress}% Complete</span>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </ProgressIndicator>

                  {milestone.tasks.map((task) => (
                    <TaskCard key={task.id} status={task.status.toLowerCase()}>
                      <TaskHeader>
                        <TaskTitle>{task.title}</TaskTitle>
                        <StatusBadge status={task.status.toLowerCase()}>
                          {task.status.replace('_', ' ')}
                        </StatusBadge>
                      </TaskHeader>
                      <TaskDescription>{task.description}</TaskDescription>
                      
                      {task.strategies && (
                        <div className="task-strategies">
                          <h6>Strategies</h6>
                          <p>{task.strategies}</p>
                        </div>
                      )}

                      {task.feedback && (
                        <div className="task-feedback">
                          <h6>Feedback</h6>
                          <p>{task.feedback}</p>
                        </div>
                      )}

                      {task.effectiveness && (
                        <span className={`effectiveness ${task.effectiveness.toLowerCase()}`}>
                          {task.effectiveness.replace('_', ' ')}
                        </span>
                      )}
                    </TaskCard>
                  ))}
                </TasksContainer>
              </MilestoneCard>
            );
          })}
        </MilestoneGrid>
      </CanvasArea>
    </Container>
  );
};

export default MilestoneTaskList; 