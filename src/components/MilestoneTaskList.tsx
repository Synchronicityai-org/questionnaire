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
  HeartIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
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
  parentFeedback?: string;
  isEffective?: boolean | 'love' | 'neutral';
  feedbackDate?: string;
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
  parentFeedback?: string;
  isEffective?: boolean | 'love' | 'neutral';
  createdAt: string;
  updatedAt: string;
}

interface MilestoneWithTasks extends Omit<Milestone, 'tasks'> {
  tasks: MilestoneTask[];
  parentFeedback?: string;
  isEffective?: boolean | 'love' | 'neutral';
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
    milestoneFeedback?: string | null;
    milestoneIsEffective?: boolean | 'love' | 'neutral' | null;
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
  grid-template-columns: 1fr;
  gap: 1.2rem;
  padding: 1rem 0;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
  @media (min-width: 1000px) {
    grid-template-columns: repeat(3, minmax(220px, 1fr));
  }
`;

const MilestoneCard = styled.div<{ isExpanded: boolean }>`
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #E2E8F0;
  margin-bottom: 1rem;
  width: 100%;
  font-size: 1rem;
  padding: 0;
  ${props => props.isExpanded && `
    z-index: 10;
    position: relative;
    box-shadow: 0 8px 32px rgba(44,62,80,0.18);
    font-size: 1.15rem;
    @media (max-width: 900px) {
      font-size: 1rem;
    }
  `}
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
  border-radius: 14px 14px 0 0;
  margin: 0;

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
  padding: ${props => props.isExpanded ? '1.5rem 0 0 0' : '0'};
  background: #FAFAFA;
  flex: 1;
  overflow: visible;
  max-height: none;
  transition: all 0.3s ease;
  opacity: ${props => props.isExpanded ? '1' : '0'};
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const TaskCard = styled.div<{ status: string }>`
  background: white;
  border-radius: 8px;
  padding: 1.5rem 1rem;
  margin-bottom: 1.5rem;
  min-height: 320px;
  transition: all 0.2s ease;
  border: 1px solid ${props => {
    switch (props.status.toLowerCase()) {
      case 'completed': return '#DCF7E3';
      case 'in_progress': return '#FFEDD5';
      default: return '#E2E8F0';
    }
  }};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  box-sizing: border-box;

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

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44, 62, 80, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  min-width: 350px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(44,62,80,0.18);
  position: relative;
`;
const ModalClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748B;
  cursor: pointer;
  z-index: 10;
  padding: 0 0.5rem;
`;

const SmileyRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 12px;
  margin-bottom: 12px;
  align-items: center;
  justify-content: flex-start;
`;
const SmileyButton = styled.button<{ selected: boolean }>`
  background: none;
  border: none;
  font-size: 2.2rem;
  cursor: pointer;
  opacity: ${props => (props.selected ? 1 : 0.5)};
  transition: opacity 0.2s;
  outline: ${props => (props.selected ? '2px solid #357ABD' : 'none')};
  border-radius: 50%;
  padding: 0.2em 0.4em;
`;

const CollapseButton = styled.button`
  margin: 2rem auto 0 auto;
  display: block;
  background: #E2E8F0;
  color: #2C3E50;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2.5rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #CBD5E1;
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
  const [milestoneFeedbackState, setMilestoneFeedbackState] = useState<{ [milestoneId: string]: { feedback: string; isEffective: boolean | 'love' | 'neutral' } }>({});
  const [milestoneFeedbackModal, setMilestoneFeedbackModal] = useState<string | null>(null);
  const [submittingMilestoneFeedback, setSubmittingMilestoneFeedback] = useState<string | null>(null);
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
              parentFeedback: item.parentFeedback || '',
              isEffective: item.isEffective,
              feedbackDate: item.feedbackDate || '',
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

  const openMilestoneFeedbackModal = (milestone: MilestoneWithTasks) => {
    setMilestoneFeedbackModal(milestone.id);
    setMilestoneFeedbackState(prev => ({
      ...prev,
      [milestone.id]: {
        feedback: milestone.parentFeedback || '',
        isEffective: typeof milestone.isEffective === 'boolean' ? milestone.isEffective : (milestone.isEffective || 'neutral')
      }
    }));
  };

  const closeMilestoneFeedbackModal = () => setMilestoneFeedbackModal(null);

  const handleMilestoneFeedbackChange = (milestoneId: string, field: 'feedback' | 'isEffective', value: string | boolean) => {
    setMilestoneFeedbackState(prev => ({
      ...prev,
      [milestoneId]: {
        ...prev[milestoneId],
        [field]: value
      }
    }));
  };

  const handleSubmitMilestoneFeedback = async (milestone: MilestoneWithTasks) => {
    setSubmittingMilestoneFeedback(milestone.id);
    try {
      const feedback = milestoneFeedbackState[milestone.id]?.feedback || '';
      const isEffective = milestoneFeedbackState[milestone.id]?.isEffective;
      await client.models.MilestoneTask.update({
        id: milestone.id,
        parentFeedback: feedback,
        isEffective: isEffective === true ? true : isEffective === false ? false : null,
        feedbackDate: new Date().toISOString(),
      });
      await fetchMilestoneTasks();
      setMilestoneFeedbackState(prev => ({ ...prev, [milestone.id]: { feedback: '', isEffective: 'neutral' } }));
      setMilestoneFeedbackModal(null);
    } catch (err) {
      alert('Failed to submit milestone feedback.');
    } finally {
      setSubmittingMilestoneFeedback(null);
    }
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
              <MilestoneCard key={milestone.id} isExpanded={isExpanded} style={{ cursor: 'pointer' }} onClick={e => {
                if ((e.target as HTMLElement).closest('.expand-arrow')) return;
                navigate(`/milestone/${milestone.id}`);
              }}>
                <CardHeader 
                  progress={progress}
                  onClick={e => {
                    e.stopPropagation();
                    toggleMilestone(milestone.id);
                  }}
                  style={isExpanded ? { cursor: 'default', fontSize: '1.5rem', padding: '2rem 1.5rem' } : {}}
                >
                  <CardTitle>
                    <Icon />
                    <h3 title={milestone.title}>{milestone.title}</h3>
                    <button
                      style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
                      title="Milestone Details"
                      onClick={e => { e.stopPropagation(); navigate(`/milestone/${milestone.id}`); }}
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
                      title="Give feedback on this milestone"
                      onClick={e => { e.stopPropagation(); openMilestoneFeedbackModal(milestone); }}
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    </button>
                  </CardTitle>
                  {isExpanded && milestone.description && (
                    <div style={{
                      margin: '0.25rem 0 0.5rem 0',
                      fontSize: '0.98rem',
                      color: '#64748B',
                      lineHeight: 1.4,
                      fontWeight: 400,
                      maxWidth: '90%'
                    }}>
                      {milestone.description}
                    </div>
                  )}
                  <CardMeta>
                    <span>Updated: {formatDate(milestone.updatedAt)}</span>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 expand-arrow" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 expand-arrow" />
                    )}
                  </CardMeta>
                </CardHeader>
                <TasksContainer isExpanded={isExpanded}>
                  {isExpanded && (
                    <>
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
                          <TaskDescription style={{ textAlign: 'left' }}>{task.description}</TaskDescription>
                          
                          {task.strategies && (
                            <div className="task-strategies" style={{ textAlign: 'left' }}>
                              <h6 style={{ margin: 0, fontWeight: 600 }}>Strategies</h6>
                              <p style={{ margin: 0 }}>{task.strategies}</p>
                            </div>
                          )}

                          {task.parentFeedback && (
                            <div className="task-parent-feedback" style={{ textAlign: 'left' }}>
                              <h6 style={{ margin: 0, fontWeight: 600 }}>Parent Feedback</h6>
                              <p style={{ margin: 0 }}>{task.parentFeedback}</p>
                            </div>
                          )}

                          {typeof task.isEffective === 'boolean' && (
                            <div className="task-effective-flag" style={{ textAlign: 'left' }}>
                              <strong>Effective?:</strong> {task.isEffective ? 'Yes' : 'No'}
                            </div>
                          )}

                          {task.feedbackDate && (
                            <div className="task-feedback-date" style={{ textAlign: 'left' }}>
                              <strong>Feedback Date:</strong> {formatDate(task.feedbackDate)}
                            </div>
                          )}
                        </TaskCard>
                      ))}
                      <CollapseButton onClick={() => toggleMilestone(milestone.id)}>
                        Collapse
                      </CollapseButton>
                    </>
                  )}
                </TasksContainer>
              </MilestoneCard>
            );
          })}
        </MilestoneGrid>
      </CanvasArea>

      {/* Milestone Feedback Modal */}
      {milestoneFeedbackModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalClose onClick={closeMilestoneFeedbackModal} title="Close">&times;</ModalClose>
            <h2>Feedback for: {milestones.find(m => m.id === milestoneFeedbackModal)?.title}</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSubmitMilestoneFeedback(milestones.find(m => m.id === milestoneFeedbackModal)!);
              }}
              style={{ marginTop: 16 }}
            >
              <div>
                <label htmlFor={`milestoneFeedback-modal-${milestoneFeedbackModal}`}>Your Feedback:</label>
                <textarea
                  id={`milestoneFeedback-modal-${milestoneFeedbackModal}`}
                  value={milestoneFeedbackState[milestoneFeedbackModal]?.feedback || ''}
                  onChange={e => handleMilestoneFeedbackChange(milestoneFeedbackModal, 'feedback', e.target.value)}
                  rows={6}
                  style={{ width: '100%', marginTop: 4, minHeight: 120 }}
                  required
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label>How do you feel about this milestone?</label>
                <SmileyRow>
                  <SmileyButton
                    type="button"
                    selected={milestoneFeedbackState[milestoneFeedbackModal]?.isEffective === 'love'}
                    onClick={() => handleMilestoneFeedbackChange(milestoneFeedbackModal, 'isEffective', 'love')}
                    title="Love it"
                  >
                    ❤️‍🔥
                  </SmileyButton>
                  <SmileyButton
                    type="button"
                    selected={milestoneFeedbackState[milestoneFeedbackModal]?.isEffective === true}
                    onClick={() => handleMilestoneFeedbackChange(milestoneFeedbackModal, 'isEffective', true)}
                    title="Happy"
                  >
                    😃
                  </SmileyButton>
                  <SmileyButton
                    type="button"
                    selected={milestoneFeedbackState[milestoneFeedbackModal]?.isEffective === 'neutral'}
                    onClick={() => handleMilestoneFeedbackChange(milestoneFeedbackModal, 'isEffective', 'neutral')}
                    title="Neutral"
                  >
                    😐
                  </SmileyButton>
                  <SmileyButton
                    type="button"
                    selected={milestoneFeedbackState[milestoneFeedbackModal]?.isEffective === false}
                    onClick={() => handleMilestoneFeedbackChange(milestoneFeedbackModal, 'isEffective', false)}
                    title="Unhappy"
                  >
                    🙁
                  </SmileyButton>
                </SmileyRow>
              </div>
              <button
                type="submit"
                disabled={submittingMilestoneFeedback === milestoneFeedbackModal}
                style={{ marginTop: 20, width: '100%', background: '#64748B', color: 'white', fontWeight: 700, fontSize: 18, padding: '14px 0', border: 'none', borderRadius: 6, cursor: 'pointer', boxShadow: '0 2px 8px rgba(100,116,139,0.12)' }}
              >
                {submittingMilestoneFeedback === milestoneFeedbackModal ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default MilestoneTaskList; 