// src/App.js
import { Amplify } from 'aws-amplify';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import React, { useCallback, useEffect, useState } from 'react';
import awsConfig from './config';

import { SignInForm, SignUpForm } from './components/Auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage'; // Import the new LandingPage component

Amplify.configure(awsConfig);

export default function App() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('signIn');
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    setLoading(true);
    try {
      const { userId, username } = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser({ userId, username, ...attributes });
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If the user is not logged in, show the new LandingPage
  if (!user) {
    return (
      <LandingPage>
        {authScreen === 'signIn' ? (
          <SignInForm setAuthScreen={setAuthScreen} onSignIn={checkUser} />
        ) : (
          <SignUpForm setAuthScreen={setAuthScreen} />
        )}
      </LandingPage>
    );
  }

  // If the user is logged in, show the Dashboard
  return <Dashboard user={user} />;
}
