import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Fix: Import modular auth functions from the local firebase lib to resolve potential resolution errors
import { onAuthStateChanged, signOut, auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CreateDonation from './pages/CreateDonation';
import ChatRoom from './pages/ChatRoom';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('kindshare_theme') === 'dark';
  });
   useEffect(() => {
    // Fix: Use modular onAuthStateChanged with the auth instance correctly
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch additional user data (role, name) from Firestore
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            id: fbUser.uid,
            ...userDoc.data()
          } as User);
        } else {
          // Handle case where auth exists but doc doesn't
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
};
return default App;