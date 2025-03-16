import { useState, useEffect } from 'react';
import { getCurrentUser, fetchUserAttributes, signUp, signIn, signOut } from 'aws-amplify/auth';

export type ProfileType = 'PARENT' | 'CAREGIVER' | 'CLINICIAN';

interface AuthUser {
  id: string;
  email: string;
  profileType: ProfileType | null;
  givenName: string;
  familyName: string;
  phoneNumber: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const attributes = await fetchUserAttributes();
        setIsAuthenticated(true);
        setUser({
          id: currentUser.userId,
          email: attributes.email || '',
          profileType: (attributes['custom:profileType'] as ProfileType) || null,
          givenName: attributes.givenName || '',
          familyName: attributes.familyName || '',
          phoneNumber: attributes.phoneNumber || ''
        });
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    givenName: string,
    familyName: string,
    phoneNumber: string
  ) => {
    try {
      const { userId } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            givenName,
            familyName,
            phoneNumber
          }
        }
      });
      return userId;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const setProfileType = async (profileType: ProfileType) => {
    try {
      // Update the user's profile type in Cognito
      // Note: You'll need to implement the actual API call to update the custom attribute
      // This might require a Lambda function or backend API
      
      // Update local state
      if (user) {
        setUser({ ...user, profileType });
      }
      return true;
    } catch (error) {
      console.error('Error setting profile type:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signIn({ username: email, password });
      await checkAuthState();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    register,
    login,
    logout,
    setProfileType,
    checkAuthState
  };
}; 