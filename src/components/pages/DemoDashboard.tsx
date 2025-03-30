import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DemoDashboard.css';

const mockKid = {
  name: 'Ayaan',
  age: 5,
  diagnosis: 'Autism Spectrum Disorder',
};

const mockMilestone = {
  id: '1',
  title: 'Social Communication Development',
  description: 'Focus on developing core social communication skills through structured activities and daily interactions',
  progress: 65,
  tasks: [
    {
      id: 't1',
      title: 'Joint Attention Activities',
      description: 'Practice following and directing attention to objects and activities with others',
      status: 'in-progress',
      feedback: ['Shows good progress in following pointing gestures', 'Maintains eye contact for 3-5 seconds during activities']
    },
    {
      id: 't2',
      title: 'Turn-taking in Conversations',
      description: 'Engage in simple back-and-forth exchanges using preferred topics',
      status: 'in-progress',
      feedback: ['Successfully takes turns in simple question-answer exchanges', 'Needs more practice with topic maintenance']
    },
    {
      id: 't3',
      title: 'Emotion Recognition',
      description: 'Identify and label basic emotions in pictures and real-life situations',
      status: 'pending',
      feedback: []
    },
    {
      id: 't4',
      title: 'Social Greetings',
      description: 'Practice appropriate greeting behaviors in different contexts',
      status: 'completed',
      feedback: ['Consistently uses "hello" and "goodbye"', 'Working on adding appropriate facial expressions']
    }
  ]
};

const mockTeam = [
  { id: 'u1', name: 'Dr. Sarah Smith', role: 'Behavioral Therapist' },
  { id: 'u2', name: 'Michael Chen', role: 'Speech Language Pathologist' },
  { id: 'u3', name: 'Emily Rodriguez', role: 'Occupational Therapist' },
  { id: 'u4', name: 'Lisa Johnson', role: 'Parent' },
];

export default function DemoDashboard() {
  console.log(React.version);
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, Parent</h1>
        <p className="subtitle">Here's how {mockKid.name} is progressing today</p>
      </div>

      <div className="dashboard-content">
        <div className="current-milestone">
          <div className="section-header">
            <h2>Current Milestone</h2>
            <div className="trophy-icon">🏆</div>
          </div>
          
          <h3>{mockMilestone.title}</h3>
          <p>{mockMilestone.description}</p>
          
          <div className="progress-section">
            <label>Overall Progress</label>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${mockMilestone.progress}%` }}
              />
            </div>
            <span className="progress-text">{mockMilestone.progress}%</span>
          </div>

          <div className="tasks-section">
            <h4>Current Tasks</h4>
            {mockMilestone.tasks.map(task => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <div className="task-status-indicator">
                  {task.status === 'completed' && '✓'}
                  {task.status === 'in-progress' && '⟳'}
                  {task.status === 'pending' && '○'}
                </div>
                <div className="task-content">
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
              </div>
            ))}
          </div>
        </div>

        <div className="support-team">
          <div className="section-header">
            <h2>{mockKid.name}'s Support Team</h2>
            <div className="team-icon">👥</div>
          </div>
          
          <div className="team-members">
            {mockTeam.map(member => (
              <div key={member.id} className="team-member">
                <div className="member-avatar">
                  {member.name.charAt(0)}
                </div>
                <div className="member-info">
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="primary-button"
          onClick={() => navigate('/questionnaire/demo')}
        >
          Start Questionnaire
        </button>
        <button 
          className="secondary-button"
          onClick={() => navigate('/feedback')}
        >
          Give Feedback
        </button>
      </div>
    </div>
  );
}
