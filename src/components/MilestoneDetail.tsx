import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import styled from 'styled-components';

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

const MilestoneDetail: React.FC = () => {
  const { milestoneId } = useParams<{ milestoneId: string }>();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<{ [taskId: string]: { parentFeedback: string; isEffective: boolean | 'love' | 'neutral' } }>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

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

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>{error}</Container>;
  if (!milestone) return <Container>Milestone not found.</Container>;

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>← Back to Milestones</BackButton>
      <MilestoneHeader>
        <MilestoneTitle>{milestone.title}</MilestoneTitle>
        <MilestoneMeta>Updated: {milestone.updatedAt ? new Date(milestone.updatedAt).toLocaleDateString() : ''}</MilestoneMeta>
        {milestone.description && <Description style={{ color: '#e0e7ef', margin: 0 }}>{milestone.description}</Description>}
      </MilestoneHeader>
      {tasks.map(task => (
        <TaskCard key={task.id}>
          <h3 style={{ textAlign: 'left' }}>{task.title}</h3>
          <div style={{ color: '#64748B', marginBottom: 8, textAlign: 'left' }}>{task.strategies}</div>
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