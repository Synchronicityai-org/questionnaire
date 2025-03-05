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

function App() {
  const [kidProfiles, setKidProfiles] = useState<Schema["KidProfile"]["type"][]>([]);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await client.models.KidProfile.list();
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
      // Create parent user first
      const parentResponse = await client.models.User.create({
        username: 'sarah_johnson',
        fName: 'Sarah',
        mName: '',
        lName: 'Johnson',
        phoneNumber: '(555) 123-4567',
        email: 'sarah.johnson@example.com',
        password: 'password123',
        address: '789 Maple Avenue, Springfield, IL',
        dob: '1985-06-15',
        role: 'PARENT'
      });

      if (!parentResponse.data?.id) {
        throw new Error('No parent ID returned');
      }

      // Create three kid profiles with different ages and needs
      const kids = [
        {
          name: 'Emma Johnson',
          age: 4,
          dob: '2020-03-12'
        },
        {
          name: 'Lucas Johnson',
          age: 6,
          dob: '2018-07-25'
        },
        {
          name: 'Sophie Johnson',
          age: 3,
          dob: '2021-01-08'
        }
      ];

      for (const kid of kids) {
        const kidResponse = await client.models.KidProfile.create({
          name: kid.name,
          age: kid.age,
          dob: kid.dob,
          parentId: parentResponse.data.id,
          isDummy: true as boolean, // Explicitly type as boolean
        });

        if (kidResponse.data?.id) {
          // Create a team for each kid
          const team = await client.models.Team.create({
            name: `${kid.name}'s Care Team`,
            kidProfileId: kidResponse.data.id,
            adminId: parentResponse.data.id
          });

          if (team.data?.id) {
            // Create team members (professionals) for each kid
            const teamMembers = [
              {
                name: 'Dr. Michael Chen',
                role: 'CLINICIAN',
                email: 'dr.chen@example.com'
              },
              {
                name: 'Emily Parker',
                role: 'CAREGIVER',
                email: 'emily.p@example.com'
              }
            ];

            for (const member of teamMembers) {
              const userResponse = await client.models.User.create({
                username: member.email.split('@')[0],
                fName: member.name.split(' ')[0],
                lName: member.name.split(' ')[1],
                email: member.email,
                phoneNumber: '(555) 000-0000',
                password: 'password123',
                dob: new Date().toISOString(),
                role: member.role as 'CLINICIAN' | 'CAREGIVER'
              });

              if (userResponse.data?.id) {
                await client.models.TeamMember.create({
                  teamId: team.data.id,
                  userId: userResponse.data.id,
                  role: 'MEMBER',
                  status: 'ACTIVE',
                  invitedBy: 'sarah.johnson@example.com',
                  invitedAt: new Date().toISOString(),
                  joinedAt: new Date().toISOString()
                });
              }
            }
          }
        }
      }

      await fetchProfiles();
      setIsRegistered(true);
    } catch (err) {
      console.error('Error creating test profiles:', err);
      setError('Failed to create test profiles.');
    }
  };

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
  };

  const KidProfilesScreen = () => {
    if (isLoading) {
      return <div>Loading profiles...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    // Filter to show only dummy profiles in demo mode
    const dummyProfiles = kidProfiles.filter(profile => {
      const profileData = profile as unknown as { isDummy?: boolean };
      return profileData.isDummy === true;
    });

    return (
      <div className="profiles-container">
        <h2>Kid Profiles</h2>
        {dummyProfiles.length === 0 ? (
          <div className="empty-state">
            <p>No profiles found. Click the button below to create test profiles.</p>
            <button onClick={createTestProfile} className="create-profile-btn">
              Create Test Profiles
            </button>
          </div>
        ) : (
          <div className="profiles-grid">
            {dummyProfiles.map(profile => (
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
                <Navigate to="/dashboard" />
              ) : (
                <LandingPage onDemoClick={createTestProfile} />
              )
            } />
            <Route path="/register" element={
              <RegistrationForm onSuccess={handleRegistrationSuccess} />
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
