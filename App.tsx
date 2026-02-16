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
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kindshare_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kindshare_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = async () => {
    try {
      // Fix: Use modular signOut with the auth instance
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen transition-colors duration-300">
        <Navbar user={currentUser} onLogout={handleLogout} isDark={isDark} onToggleTheme={toggleTheme} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage user={currentUser} />} />
            <Route 
              path="/auth" 
              element={!currentUser ? <AuthPage /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/donate" 
              element={currentUser?.role === 'DONOR' ? <CreateDonation user={currentUser} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/donations/:id" 
              element={currentUser ? <DonationDetails user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/chat/:id" 
              element={currentUser ? <ChatRoom user={currentUser} /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};
export default App;