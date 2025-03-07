import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { KidProfileHome } from "./components/KidProfileHome";
import RegistrationForm from "./components/auth/RegistrationForm";
import { LandingPage } from "./components/LandingPage";
import { Header } from './components/Header';
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

function App() {
  const [kidProfiles, setKidProfiles] = useState<KidProfileType[]>([]);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      console.log('Fetching profiles...');
      const response = await client.models.KidProfile.list({
        selectionSet: ['id', 'name', 'age', 'dob', 'parentId', 'isDummy', 'createdAt', 'updatedAt'],
        filter: {
          isDummy: {
            eq: true
          }
        }
      });
      console.log('Raw response:', response);
      
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

  const createTestProfile = async () => {
    try {
      console.log('Checking for existing dummy profiles...');
      const existingProfiles = await client.models.KidProfile.list({
        selectionSet: ['id', 'name', 'age', 'dob', 'parentId', 'isDummy', 'createdAt', 'updatedAt'],
        filter: {
          isDummy: {
            eq: true
          }
        }
      });
      
      if (existingProfiles?.data && existingProfiles.data.length > 0) {
        console.log('Found dummy profiles:', existingProfiles.data);
        setKidProfiles(existingProfiles.data);
        setIsRegistered(true);
        return;
      }

      setError('No demo profiles available. Please contact the administrator.');
    } catch (err) {
      console.error('Error checking for demo profiles:', err);
      setError('Failed to load demo profiles. Please try again later.');
    }
  };

  const handleRegistrationSuccess = async (data: { userId: string; kidProfileId: string; teamId: string }) => {
    console.log('Registration successful, navigating to dashboard...', data);
    
    try {
      // First fetch the profiles
      await fetchProfiles();
      console.log('Profiles fetched successfully after registration');
      
      // Then set the states that trigger navigation
      setSelectedKidId(data.kidProfileId);
      setIsRegistered(true);
    } catch (err) {
      console.error('Error fetching profiles after registration:', err);
    }
  };

  // Add useEffect to handle navigation when selectedKidId changes
  useEffect(() => {
    if (selectedKidId) {
      console.log('Selected kid ID changed, navigating to dashboard:', selectedKidId);
    }
  }, [selectedKidId]);

  const KidProfilesScreen = () => {
    if (isLoading) {
      return <div>Loading profiles...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    return (
      <div className="profiles-container">
        <h2>Demo Profiles</h2>
        {kidProfiles.length === 0 ? (
          <div className="empty-state">
            <p>No demo profiles available.</p>
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
    <Router>
      <div className="app">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={
              isRegistered ? (
                <Navigate to="/dashboard" replace={true} />
              ) : (
                <LandingPage onDemoClick={createTestProfile} />
              )
            } />
            <Route path="/register" element={
              isRegistered ? (
                <Navigate to="/dashboard" replace={true} />
              ) : (
                <RegistrationForm onSuccess={handleRegistrationSuccess} />
              )
            } />
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
