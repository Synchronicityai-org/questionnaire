import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LandingPage from './components/pages/LandingPage';
import ProfileSetup from './components/auth/ProfileSetup';
import KidProfileForm from './components/auth/KidProfileForm';
import TeamList from './components/team/TeamList';
import TeamManagement from './components/team/TeamManagement';
import TeamRequest from './components/team/TeamRequest';
import { KidProfileHome } from './components/KidProfileHome';
import ProtectedRoute from './components/common/ProtectedRoute';
import QuestionnaireForm from './components/QuestionnaireForm';
import { ParentConcernsForm } from './components/ParentConcernsForm';
import './App.css';

interface HubPayload {
  event: string;
  data?: any;
  message?: string;
}

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const listener = Hub.listen('auth', async ({ payload }: { payload: HubPayload }) => {
      switch (payload.event) {
        case 'signIn':
          await handleSignIn();
          break;
        case 'signOut':
          setIsAuthenticated(false);
          break;
      }
    });

    return () => {
      listener();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        await checkUserProfile(user.userId);
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setIsAuthenticated(false);
    }
  };

  const checkUserProfile = async (userId: string) => {
    try {
      const client = generateClient<Schema>();
      const userResponse = await client.models.User.get({ id: userId });
      
      if (!userResponse.data) {
        navigate('/profile-setup');
        return;
      }

      if (userResponse.data.role === 'PARENT') {
        const kidProfiles = await client.models.KidProfile.list({
          filter: {
            parentId: {
              eq: userId
            }
          }
        });
        
        if (!kidProfiles.data || kidProfiles.data.length === 0) {
          navigate('/kid-profile-form');
        } else {
          navigate(`/kid-profile/${kidProfiles.data[0].id}`);
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      navigate('/profile-setup');
    }
  };

  const checkUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        await checkUserProfile(user.userId);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <Header isAuthenticated={isAuthenticated} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={
            isAuthenticated ? (
              <Navigate to="/kid-profile" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          <Route path="/profile-setup" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/kid-profile-form" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <KidProfileForm onSubmit={({ kidProfileId }) => navigate(`/kid-profile/${kidProfileId}`)} />
            </ProtectedRoute>
          } />
          <Route path="/team-list" element={<ProtectedRoute isAuthenticated={isAuthenticated}><TeamList /></ProtectedRoute>} />
          <Route path="/team-management" element={<ProtectedRoute isAuthenticated={isAuthenticated}><TeamManagement /></ProtectedRoute>} />
          <Route path="/team-request" element={<ProtectedRoute isAuthenticated={isAuthenticated}><TeamRequest /></ProtectedRoute>} />
          <Route path="/kid-profile/:kidProfileId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <KidProfileHome />
            </ProtectedRoute>
          } />
          <Route path="/kid-profile" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <KidProfileHome />
            </ProtectedRoute>
          } />
          <Route path="/parent-concerns/:kidProfileId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ParentConcernsForm 
                onSubmit={(concerns: string) => {
                  // Handle saving concerns if needed
                  console.log('Parent concerns:', concerns);
                }}
              />
            </ProtectedRoute>
          } />
          <Route path="/questionnaire/:kidProfileId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <QuestionnaireForm />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
