import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LandingPage from './components/pages/LandingPage';
import ProfileSetup from './components/auth/ProfileSetup';
import KidProfileForm from './components/auth/KidProfileForm';
import TeamList from './components/team/TeamList';
import TeamManagement from './components/team/TeamManagement';
import RoleSelection from './components/auth/RoleSelection';
import TeamRequest from './components/team/TeamRequest';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

interface HubPayload {
  event: string;
  data?: any;
  message?: string;
}

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkUser();
    const listener = Hub.listen('auth', async ({ payload }: { payload: HubPayload }) => {
      switch (payload.event) {
        case 'signIn':
          await checkUser();
          break;
        case 'signOut':
          setIsAuthenticated(false);
          navigate('/');
          break;
        case 'customOAuthState':
          const user = await getCurrentUser();
          if (user) {
            setIsAuthenticated(true);
          }
          break;
        case 'tokenRefresh':
          await checkUser();
          break;
        case 'tokenRefresh_failure':
          await signOut();
          break;
      }
    });

    return () => {
      listener();
    };
  }, [navigate]);

  const checkUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="app">
      <Header isAuthenticated={isAuthenticated} />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected routes */}
          <Route path="/role-selection" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RoleSelection isModal={false} />
            </ProtectedRoute>
          } />
          <Route path="/profile-setup" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/create-kid-profile" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <KidProfileForm onSubmit={async ({ teamId }) => {
                // Wait a bit for the team creation to complete
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Navigate to the team page
                navigate(`/team/${teamId}`);
              }} />
            </ProtectedRoute>
          } />
          <Route path="/team-request" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TeamRequest />
            </ProtectedRoute>
          } />
          <Route path="/team-list" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TeamList />
            </ProtectedRoute>
          } />
          <Route path="/team/:teamId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TeamManagement />
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
