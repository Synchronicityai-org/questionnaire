import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Header } from './Header';
import './KidProfileHome.css';
import { QuestionnaireForm } from './QuestionnaireForm';
import { AssessmentHistory } from './AssessmentHistory';

const client = generateClient<Schema>();

interface KidProfileHomeProps {
  kidProfileId: string;
  onBack?: () => void;
}

interface KidProfile {
  id: string;
  name: string | null;
  age: number | null;
  dob: string | null;
  parentId: string;
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
}

export function KidProfileHome({ kidProfileId }: KidProfileHomeProps) {
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchKidProfile();
    fetchTeamMembers();
    fetchCurrentMilestone();
  }, [kidProfileId]);

  const fetchKidProfile = async () => {
    try {
      const response = await client.models.KidProfile.get({ id: kidProfileId });
      if (response?.data) {
        setProfile({
          id: response.data.id || kidProfileId,
          name: response.data.name,
          age: response.data.age,
          dob: response.data.dob,
          parentId: response.data.parentId || ''
        });
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching kid profile:', err);
      setError('Failed to load profile information.');
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    // TODO: Implement team members fetching
    setTeamMembers([
      { id: '1', name: 'Dr. Sarah Johnson', role: 'Developmental Pediatrician' },
      { id: '2', name: 'Emily Parker', role: 'Speech-Language Pathologist' },
      { id: '3', name: 'Michael Chen', role: 'Occupational Therapist' }
    ]);
  };

  const fetchCurrentMilestone = async () => {
    // TODO: Implement milestone fetching
    setCurrentMilestone({
      id: '1',
      title: 'Two-Word Phrases in Routine Settings',
      description: 'Learning to combine words to express needs and wants during daily activities.',
      tasks: [
        {
          id: '1',
          title: 'Picture Exchange Communication',
          description: 'Practice using PECS cards during snack time',
          status: 'in-progress'
        },
        {
          id: '2',
          title: 'Interactive Storytime',
          description: 'Read "The Very Hungry Caterpillar" with two-word prompts',
          status: 'pending'
        }
      ]
    });
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found.</div>;
  }

  if (showQuestionnaire) {
    return <QuestionnaireForm kidProfileId={kidProfileId} />;
  }

  if (showHistory) {
    return <AssessmentHistory kidProfileId={kidProfileId} onClose={() => setShowHistory(false)} displayFormat="qa" />;
  }

  return (
    <div className="kid-profile-page">
      <div className="content-wrapper">
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome back, {profile.name?.split(' ')[0]}</h2>
            <p>Here's how {profile.name} is progressing today</p>
          </div>
          <div className="action-buttons">
            <button className="primary-button" onClick={() => setShowQuestionnaire(true)}>
              Take Assessment
            </button>
            <button className="secondary-button" onClick={() => setShowHistory(true)}>
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
              <button className="manage-team-button">Manage Team</button>
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