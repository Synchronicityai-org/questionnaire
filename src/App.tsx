import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import config from '../amplify_outputs.json';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LandingPage from './components/pages/LandingPage';
import ProfileSetup from './components/auth/ProfileSetup';
import KidProfileForm from './components/auth/KidProfileForm';
import TeamList from './components/team/TeamList';
import TeamManagement from './components/team/TeamManagement';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

Amplify.configure(config);

const AppContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected routes */}
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/create-kid-profile" element={
            <ProtectedRoute>
              <KidProfileForm onSubmit={(teamId) => {
                navigate(`/team/${teamId}`);
              }} />
            </ProtectedRoute>
          } />
          <Route path="/team-list" element={
            <ProtectedRoute>
              <TeamList />
            </ProtectedRoute>
          } />
          <Route path="/team/:teamId" element={
            <ProtectedRoute>
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
