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
  isDummy: boolean | null;
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
      const response = await client.models.KidProfile.list();
      console.log('Raw response:', response);
      
      if (!response || !response.data) {
        console.error('No response data received');
        setError('Failed to load profiles: No data received');
        setIsLoading(false);
        return;
      }

      // Log each profile for debugging
      response.data.forEach((profile, index) => {
        console.log(`Profile ${index}:`, {
          id: profile.id,
          name: profile.name,
          isDummy: profile.isDummy,
          fullProfile: profile
        });
      });

      // Try filtering on the client side
      const dummyProfiles = response.data.filter(profile => {
        console.log('Checking profile for isDummy:', profile.name, profile.isDummy);
        return Boolean(profile.isDummy);
      });

      console.log('Dummy profiles found:', dummyProfiles.length);
      console.log('Dummy profiles:', dummyProfiles);

      if (response.data.length > 0) {
        setKidProfiles(response.data);
      } else {
        console.log('No profiles found in response');
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Failed to load profiles. Please try again later.');
      setIsLoading(false);
    }
  };

  const createTestProfile = async () => {
    try {
      console.log('Starting test profile creation...');
      
      // Create parent user first
      const parentResponse = await client.models.User.create({
        username: `sarah_johnson_${Date.now()}`, // Make username unique
        fName: 'Sarah',
        mName: '',
        lName: 'Johnson',
        phoneNumber: '(555) 123-4567',
        email: `sarah.johnson.${Date.now()}@example.com`, // Make email unique
        password: 'password123',
        address: '789 Maple Avenue, Springfield, IL',
        dob: '1985-06-15',
        role: 'PARENT'
      });

      if (!parentResponse || !parentResponse.data || !parentResponse.data.id) {
        throw new Error('Failed to create parent user');
      }

      console.log('Parent user created:', parentResponse.data);

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
        try {
          console.log('Creating kid profile:', kid.name);
          const kidResponse = await client.models.KidProfile.create({
            name: kid.name,
            age: kid.age,
            dob: kid.dob,
            parentId: parentResponse.data.id,
            isDummy: true
          });

          if (!kidResponse || !kidResponse.data || !kidResponse.data.id) {
            console.error('Failed to create kid profile:', kid.name);
            continue;
          }

          console.log('Kid profile created:', kidResponse.data);

          // Create a team for the kid
          const team = await client.models.Team.create({
            name: `${kid.name}'s Care Team`,
            kidProfileId: kidResponse.data.id,
            adminId: parentResponse.data.id
          });

          if (!team || !team.data || !team.data.id) {
            console.error('Failed to create team for:', kid.name);
            continue;
          }

          console.log('Team created for:', kid.name);

          // Create team members with unique usernames and emails
          const timestamp = Date.now();
          const teamMembers = [
            {
              name: 'Dr. Michael Chen',
              role: 'CLINICIAN',
              email: `dr.chen.${timestamp}@example.com`,
              username: `dr_chen_${timestamp}`
            },
            {
              name: 'Emily Parker',
              role: 'CAREGIVER',
              email: `emily.p.${timestamp}@example.com`,
              username: `emily_p_${timestamp}`
            }
          ];

          for (const member of teamMembers) {
            try {
              const userResponse = await client.models.User.create({
                username: member.username,
                fName: member.name.split(' ')[0],
                lName: member.name.split(' ')[1],
                email: member.email,
                phoneNumber: '(555) 000-0000',
                password: 'password123',
                dob: new Date().toISOString().split('T')[0],
                role: member.role as 'CLINICIAN' | 'CAREGIVER'
              });

              if (userResponse?.data?.id) {
                await client.models.TeamMember.create({
                  teamId: team.data.id,
                  userId: userResponse.data.id,
                  role: 'MEMBER',
                  status: 'ACTIVE',
                  invitedBy: parentResponse.data.email,
                  invitedAt: new Date().toISOString(),
                  joinedAt: new Date().toISOString()
                });
                console.log('Team member created:', member.name);
              }
            } catch (memberErr) {
              console.error('Error creating team member:', member.name, memberErr);
            }
          }
        } catch (kidErr) {
          console.error('Error processing kid:', kid.name, kidErr);
        }
      }

      console.log('Fetching updated profiles...');
      await fetchProfiles();
      setIsRegistered(true);
    } catch (err) {
      console.error('Error creating test profiles:', err);
      setError('Failed to create test profiles.');
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

    console.log('Rendering KidProfilesScreen with profiles:', kidProfiles);

    // Filter to show only dummy profiles in demo mode
    const dummyProfiles = kidProfiles.filter(profile => {
      console.log('Filtering profile:', profile.name, 'isDummy:', profile.isDummy);
      return Boolean(profile.isDummy);
    });

    console.log('Filtered dummy profiles for display:', dummyProfiles);

    return (
      <div className="profiles-container">
        <h2>Kid Profiles</h2>
        {/* Debug info */}
        <div style={{ display: 'none' }}>
          <p>Total profiles: {kidProfiles.length}</p>
          <p>Dummy profiles: {dummyProfiles.length}</p>
        </div>
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
                {/* Debug info */}
                <p style={{ display: 'none' }}>isDummy: {String(profile.isDummy)}</p>
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
