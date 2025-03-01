import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { KidProfileHome } from "./components/KidProfileHome";
import "./App.css";

const client = generateClient<Schema>();

function App() {
  const [kidProfiles, setKidProfiles] = useState<Schema["KidProfile"]["type"][]>([]);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        username: `testparent_${Date.now()}`,
        fName: 'Test',
        mName: '',
        lName: 'Parent',
        phoneNumber: '1234567890',
        email: `testparent_${Date.now()}@example.com`,
        password: 'password123',
        address: '123 Test St',
        dob: new Date().toISOString(),
        role: 'PARENT'
      });

      if (!parentResponse.data?.id) {
        throw new Error('No ID returned');
      }

      // Create child profile
      await client.models.KidProfile.create({
        name: `Test Child ${Date.now()}`,
        age: 5,
        dob: new Date().toISOString(),
        parentId: parentResponse.data.id
      });

      await fetchProfiles();
    } catch (err) {
      console.error('Error creating test profile:', err);
      setError('Failed to create test profile.');
    }
  };

  if (isLoading) {
    return <div>Loading profiles...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (selectedKidId) {
    return (
      <KidProfileHome 
        kidProfileId={selectedKidId} 
        onBack={() => setSelectedKidId(null)}
      />
    );
  }

  return (
    <main>
      <h1>Select a Child Profile</h1>
      {kidProfiles.length === 0 ? (
        <div>
          <p>No profiles found.</p>
          <button onClick={createTestProfile}>Create Test Profile</button>
        </div>
      ) : (
        <ul>
          {kidProfiles.map(profile => (
            <li 
              key={profile.id} 
              onClick={() => profile.id && setSelectedKidId(profile.id)}
              style={{ cursor: 'pointer' }}
            >
              {profile.name || 'Unnamed Child'} ({profile.age} years old)
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
