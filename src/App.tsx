import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { KidProfileHome } from "./components/KidProfileHome";
import RegistrationForm from "./components/auth/RegistrationForm";
import { LandingPage } from "./components/LandingPage";
import { Header } from './components/Header';
import { TeamManagement } from './components/TeamManagement';
import { TeamList } from './components/TeamList';
import { QuestionnaireForm } from './components/QuestionnaireForm';
import './App.css';

const client = generateClient<Schema>();

interface KidProfileType {
  id: string | null;
  name: string | null;
  age: number | null;
  dob: string | null;
  parentId: string | null;
  isDummy: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

// Add this component before the AppContent function
function QuestionnaireWrapper() {
  const { kidProfileId } = useParams();
  return <QuestionnaireForm kidProfileId={kidProfileId || ''} />;
}

// Separate component for the main app content
function AppContent() {
  const [kidProfiles, setKidProfiles] = useState<KidProfileType[]>([]);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      console.log('Fetching profiles...');
      const userId = sessionStorage.getItem('userId');
      const mode = sessionStorage.getItem('mode');
      const isDemo = mode === 'demo';

      if (!isDemo && !userId) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      let response;
      if (isDemo) {
        response = await client.models.KidProfile.list({
          selectionSet: ['id', 'name', 'age', 'dob', 'parentId', 'isDummy', 'createdAt', 'updatedAt'],
          filter: {
            isDummy: { eq: true }
          }
        });
      } else if (userId) {
        response = await client.models.KidProfile.list({
          selectionSet: ['id', 'name', 'age', 'dob', 'parentId', 'isDummy', 'createdAt', 'updatedAt'],
          filter: {
            parentId: { eq: userId },
            isDummy: { eq: false }
          }
        });
      } else {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }
      
      if (!response || !response.data) {
        console.error('No response data received');
        setError('Failed to load profiles: No data received');
        setIsLoading(false);
        return;
      }

      setKidProfiles(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Failed to load profiles. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    sessionStorage.setItem('mode', 'demo');
    await fetchProfiles();
    navigate('/dashboard');
  };

  const handleRegistrationSuccess = async (data: { 
    userId: string; 
    kidProfileId: string; 
    teamId: string;
    nextStep: 'DASHBOARD' | 'ASSESSMENT' | 'TEAM';
    isNewRegistration?: boolean;
    role: 'PARENT' | 'CAREGIVER' | 'CLINICIAN';
  }) => {
    try {
      // Store the user ID, role, and set mode to real
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('userRole', data.role);
      sessionStorage.setItem('mode', 'real');
      
      // Navigate based on the selected next step
      if (data.nextStep === 'ASSESSMENT') {
        navigate(`/questionnaire/${data.kidProfileId}`);
      } else if (data.nextStep === 'TEAM') {
        navigate(`/team/${data.teamId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const KidProfilesScreen = () => {
    if (isLoading) {
      return <div>Loading profiles...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    const userRole = sessionStorage.getItem('userRole');
    const isParent = userRole === 'PARENT';

    if (!isParent) {
      return (
        <div className="profiles-container">
          <h2>Welcome!</h2>
          <div className="options-container">
            <div className="option-card" onClick={() => navigate('/register?step=kidProfile')}>
              <h3>Create New Kid Profile</h3>
              <p>Create a new profile for a child you'll be working with</p>
            </div>
            <div className="option-card" onClick={() => navigate('/team-management')}>
              <h3>Join Existing Team</h3>
              <p>Join a team for a child already registered in the system</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="profiles-container">
        <h2>Kid Profiles</h2>
        {kidProfiles.length === 0 ? (
          <div className="empty-state">
            <p>No profiles available.</p>
            <button onClick={fetchProfiles} className="create-profile-btn">
              Refresh Profiles
            </button>
          </div>
        ) : (
          <div className="profiles-grid">
            {kidProfiles.map(profile => (
              <div 
                key={profile.id} 
                className="profile-card"
                onClick={() => profile.id && setSelectedKidId(profile.id)}
              >
                <div className="profile-avatar">
                  {profile.name?.[0] || '?'}
                </div>
                <h3>{profile.name || 'Unnamed Child'}</h3>
                <p>{profile.age} years old</p>
                <p className="dob">Born: {new Date(profile.dob || '').toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage onDemoClick={handleDemoClick} />} />
          <Route path="/register" element={<RegistrationForm onSuccess={handleRegistrationSuccess} />} />
          <Route path="/dashboard" element={
            selectedKidId ? (
              <KidProfileHome 
                kidProfileId={selectedKidId} 
                onBack={() => setSelectedKidId(null)}
              />
            ) : (
              <KidProfilesScreen />
            )
          } />
          <Route 
            path="/team-management" 
            element={<TeamList />} 
          />
          <Route 
            path="/team-management/:kidProfileId" 
            element={<TeamManagement />} 
          />
          <Route 
            path="/questionnaire/:kidProfileId" 
            element={<QuestionnaireWrapper />} 
          />
        </Routes>
      </main>
    </div>
  );
}

// Main App component that provides the Router context
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
