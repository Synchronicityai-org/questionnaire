import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const client = generateClient<Schema>();

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(44,62,80,0.10);
`;
const Description = styled.div`
  color: #64748B;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
`;
const BackButton = styled.button`
  background: #E2E8F0;
  color: #2C3E50;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 2rem;
  margin-bottom: 2rem;
  cursor: pointer;
  &:hover { background: #CBD5E1; }
`;
const TaskCard = styled.div`
  background: #F8FAFC;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  padding: 1.2rem 1rem;
  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
`;
const MilestoneHeader = styled.div`
  padding: 1.25rem;
  background: linear-gradient(135deg, #6BCB77 0%, #4A90E2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;
const MilestoneTitle = styled.h1`
  font-size: 2rem;
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  text-align: left;
`;
const MilestoneMeta = styled.div`
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: left;
`;
const SmileyRow = styled.div`
  display: flex;
  gap: 2.5rem;
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
const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const TaskTitle = styled.h3`
  margin-bottom: 4px;
`;

const MilestoneDetail: React.FC = () => {
  const { milestoneId } = useParams<{ milestoneId: string }>();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<{ [taskId: string]: { parentFeedback: string; isEffective: boolean | 'love' | 'neutral' } }>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);
  const [milestoneStatus, setMilestoneStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED');
  const [milestoneStatusMenuOpen, setMilestoneStatusMenuOpen] = useState(false);
  const [taskStatusMenuOpen, setTaskStatusMenuOpen] = useState<string | null>(null);
  const milestoneStatusButtonRef = useRef<HTMLButtonElement | null>(null);
  const taskStatusButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isMobile = useMediaQuery({ maxWidth: 600 });

  useEffect(() => {
    if (!milestoneId) return;
    const fetchMilestone = async () => {
      setLoading(true);
      try {
        const { data } = await client.models.MilestoneTask.get({ id: milestoneId });
        setMilestone(data);
        // Fetch tasks for this milestone
        const { data: taskList } = await client.models.MilestoneTask.list({
          filter: { parentId: { eq: milestoneId }, type: { eq: 'TASK' } },
          limit: 100
        });
        setTasks(taskList || []);
        console.log('Fetched tasks for milestone', milestoneId, taskList);
        if (data && data.status) setMilestoneStatus(data.status);
      } catch (err) {
        setError('Failed to load milestone.');
      } finally {
        setLoading(false);
      }
    };
    fetchMilestone();
  }, [milestoneId]);

  const handleFeedbackChange = (taskId: string, field: 'parentFeedback' | 'isEffective', value: string | boolean) => {
    setFeedbackState(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  const handleSubmitFeedback = async (task: any) => {
    setSubmittingFeedback(task.id);
    try {
      const feedback = feedbackState[task.id]?.parentFeedback || '';
      const isEffective = feedbackState[task.id]?.isEffective;
      await client.models.MilestoneTask.update({
        id: task.id,
        parentFeedback: feedback,
        isEffective: isEffective === true ? true : isEffective === false ? false : isEffective === 'love' ? true : isEffective === 'neutral' ? null : null,
        feedbackDate: new Date().toISOString(),
      });
      // Refresh tasks here
      const { data: taskList } = await client.models.MilestoneTask.list({
        filter: { parentId: { eq: milestoneId }, type: { eq: 'TASK' } },
        limit: 100
      });
      setTasks(taskList || []);
      setFeedbackState(prev => ({ ...prev, [task.id]: { parentFeedback: '', isEffective: 'neutral' } }));
    } catch (err) {
      alert('Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const handleMilestoneStatusChange = async (newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!milestone) return;
    try {
      await client.models.MilestoneTask.update({
        id: milestone.id,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setMilestone((prev: any) => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
      setMilestoneStatus(newStatus);
    } catch (err) {
      alert('Failed to update milestone status.');
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      await client.models.MilestoneTask.update({
        id: taskId,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  useEffect(() => {
    const handleClick = () => {
      if (milestoneStatusMenuOpen) setMilestoneStatusMenuOpen(false);
      if (taskStatusMenuOpen) setTaskStatusMenuOpen(null);
    };
    if (milestoneStatusMenuOpen || taskStatusMenuOpen) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [milestoneStatusMenuOpen, taskStatusMenuOpen]);

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>{error}</Container>;
  if (!milestone) return <Container>Milestone not found.</Container>;

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>← Back to Milestones</BackButton>
      <MilestoneHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <MilestoneTitle>{milestone.title}</MilestoneTitle>
          <MilestoneMeta>Updated: {milestone.updatedAt ? new Date(milestone.updatedAt).toLocaleDateString() : ''}</MilestoneMeta>
          {milestone.description && <Description style={{ color: '#e0e7ef', margin: 0 }}>{milestone.description}</Description>}
        </div>
        <div>
          {isMobile ? (
            <select
              value={milestoneStatus}
              onChange={e => handleMilestoneStatusChange(e.target.value as any)}
              style={{ borderRadius: 6, padding: 6, fontWeight: 600 }}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                ref={milestoneStatusButtonRef}
                style={{
                  background: '#E2E8F0',
                  color: '#1E293B',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  minWidth: 120
                }}
                title="Change milestone status"
                onClick={() => {
                  setMilestoneStatusMenuOpen(v => !v);
                }}
              >
                {milestoneStatus.replace('_', ' ')}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {milestoneStatusMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#fff',
                  color: '#1E293B',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(44,62,80,0.12)',
                  zIndex: 1000,
                  minWidth: 140,
                  padding: '0.5rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0
                }}>
                  {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                    <button
                      key={status}
                      onClick={() => { handleMilestoneStatusChange(status as any); setMilestoneStatusMenuOpen(false); }}
                      style={{
                        background: milestoneStatus === status ? '#4A90E2' : 'transparent',
                        color: milestoneStatus === status ? '#fff' : '#1E293B',
                        border: 'none',
                        borderRadius: 0,
                        padding: '0.75rem 1.5rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        width: '100%'
                      }}
                      aria-pressed={milestoneStatus === status}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </MilestoneHeader>
      {tasks.map(task => (
        <TaskCard key={task.id}>
          <TaskHeader>
            <TaskTitle>{task.title}</TaskTitle>
            {isMobile ? (
              <select
                value={task.status}
                onChange={e => handleTaskStatusChange(task.id, e.target.value as any)}
                disabled={milestoneStatus === 'NOT_STARTED'}
                style={{ borderRadius: 12, padding: '2px 8px', fontWeight: 600, fontSize: 13 }}
                title={milestoneStatus === 'NOT_STARTED' ? 'Start the milestone first' : ''}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block', marginLeft: 8 }}>
                <button
                  ref={el => (taskStatusButtonRefs.current[task.id] = el)}
                  style={{
                    background: task.status === 'COMPLETED' ? '#4A90E2' : task.status === 'IN_PROGRESS' ? '#FFEDD5' : '#E2E8F0',
                    color: task.status === 'COMPLETED' ? '#fff' : task.status === 'IN_PROGRESS' ? '#9A3412' : '#475569',
                    border: 'none',
                    borderRadius: 12,
                    padding: '2px 12px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: milestoneStatus === 'NOT_STARTED' ? 'not-allowed' : 'pointer',
                    opacity: milestoneStatus === 'NOT_STARTED' ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title={milestoneStatus === 'NOT_STARTED' ? 'Start the milestone first' : 'Change task status'}
                  onClick={() => {
                    if (milestoneStatus === 'NOT_STARTED') return;
                    setTaskStatusMenuOpen(taskStatusMenuOpen === task.id ? null : task.id);
                  }}
                  disabled={milestoneStatus === 'NOT_STARTED'}
                >
                  {task.status.replace('_', ' ')}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {taskStatusMenuOpen === task.id && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: '#fff',
                    color: '#1E293B',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(44,62,80,0.12)',
                    zIndex: 1000,
                    minWidth: 120,
                    padding: '0.5rem 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0
                  }}>
                    {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                      <button
                        key={status}
                        onClick={() => { handleTaskStatusChange(task.id, status as any); setTaskStatusMenuOpen(null); }}
                        style={{
                          background: task.status === status ? '#4A90E2' : 'transparent',
                          color: task.status === status ? '#fff' : '#1E293B',
                          border: 'none',
                          borderRadius: 0,
                          padding: '0.75rem 1.5rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          width: '100%'
                        }}
                        aria-pressed={task.status === status}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TaskHeader>
          {task.parentFriendlyDescription && (
            <div style={{ color: '#64748B', marginBottom: 8, textAlign: 'left' }}>
              {task.parentFriendlyDescription}
            </div>
          )}
          {task.strategies && (
            <div className="task-strategies" style={{ textAlign: 'left', marginBottom: 12 }}>
              <h6 style={{ margin: 0, fontWeight: 600 }}>Strategies</h6>
              <p style={{ margin: 0 }}>{task.strategies}</p>
            </div>
          )}
          {/* Show previously submitted feedback */}
          {task.parentFeedback && (
            <div style={{ marginBottom: 8, color: '#357ABD', fontStyle: 'italic' }}>
              <strong>Previous Feedback:</strong> {task.parentFeedback}
              {task.feedbackDate && (
                <span style={{ color: '#64748B', marginLeft: 12 }}>
                  (on {new Date(task.feedbackDate).toLocaleString()})
                </span>
              )}
            </div>
          )}
          {typeof task.isEffective !== 'undefined' && task.isEffective !== null && (
            <div style={{ marginBottom: 8 }}>
              <strong>Previous Effectiveness:</strong> {
                task.isEffective === 'love' ? '❤️' :
                task.isEffective === true ? '😃' :
                task.isEffective === 'neutral' ? '😐' :
                task.isEffective === false ? '🙁' : ''
              }
            </div>
          )}
          {/* Inline Feedback Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmitFeedback(task);
            }}
            style={{ marginTop: 12, background: '#f6f8fa', padding: 12, borderRadius: 8, textAlign: 'left' }}
          >
            <div>
              <label htmlFor={`parentFeedback-${task.id}`}>Your Feedback:</label>
              <textarea
                id={`parentFeedback-${task.id}`}
                value={feedbackState[task.id]?.parentFeedback || ''}
                onChange={e => handleFeedbackChange(task.id, 'parentFeedback', e.target.value)}
                rows={4}
                style={{ width: '100%', marginTop: 4, minHeight: 80 }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <label>Was this task effective?</label>
              <SmileyRow>
                <SmileyButton
                  type="button"
                  selected={feedbackState[task.id]?.isEffective === 'love'}
                  onClick={() => handleFeedbackChange(task.id, 'isEffective', 'love')}
                  title="Love it"
                >
                  ❤️
                </SmileyButton>
                <SmileyButton
                  type="button"
                  selected={feedbackState[task.id]?.isEffective === true}
                  onClick={() => handleFeedbackChange(task.id, 'isEffective', true)}
                  title="Happy"
                >
                  😃
                </SmileyButton>
                <SmileyButton
                  type="button"
                  selected={feedbackState[task.id]?.isEffective === 'neutral'}
                  onClick={() => handleFeedbackChange(task.id, 'isEffective', 'neutral')}
                  title="Neutral"
                >
                  😐
                </SmileyButton>
                <SmileyButton
                  type="button"
                  selected={feedbackState[task.id]?.isEffective === false}
                  onClick={() => handleFeedbackChange(task.id, 'isEffective', false)}
                  title="Unhappy"
                >
                  🙁
                </SmileyButton>
              </SmileyRow>
            </div>
            <button
              type="submit"
              disabled={submittingFeedback === task.id}
              style={{ marginTop: 12, background: '#64748B', color: 'white', fontWeight: 700, fontSize: 16, padding: '10px 0', border: 'none', borderRadius: 6, cursor: 'pointer', width: '100%' }}
            >
              {submittingFeedback === task.id ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </TaskCard>
      ))}
    </Container>
  );
};

export default MilestoneDetail; 