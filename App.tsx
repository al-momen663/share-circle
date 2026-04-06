
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Fix: Import modular auth functions from the local firebase lib to resolve potential resolution errors
import { onAuthStateChanged, signOut, auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CreateDonation from './pages/CreateDonation';
import DonationDetails from './pages/DonationDetails';
import EditDonation from './pages/EditDonation';  
import ChatRoom from './pages/ChatRoom';
import Marketplace from './pages/Marketplace';
import CreateMarketItem from './pages/CreateMarketItem';
import MarketItemDetails from './pages/MarketItemDetails';
import EditMarketItem from './pages/EditMarketItem';
import { User, UserRole } from './types';
import './lib/leaflet-setup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('kindshare_theme') === 'dark';
  });

  useEffect(() => {
    // Fix: Use modular onAuthStateChanged with the auth instance correctly
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setLoadingProfile(true);
        try {
          // Fetch additional user data (role, name) from Firestore
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              id: fbUser.uid,
              ...userDoc.data()
            } as User);
          } else {
            // Fallback for missing Firestore document
            setCurrentUser({
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              email: fbUser.email || '',
              role: UserRole.DONOR,
              avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'U'}&background=10b981&color=fff&bold=true`
            } as User);
          }
        } catch (error) {
          console.error("Error fetching user doc:", error);
          // Still set a minimal user so they aren't stuck
          setCurrentUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || '',
            role: UserRole.DONOR,
            avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'U'}&background=10b981&color=fff&bold=true`
          } as User);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setCurrentUser(null);
        setLoadingProfile(false);
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
        <Navbar 
          user={currentUser} 
          onLogout={handleLogout} 
          isDark={isDark} 
          onToggleTheme={toggleTheme} 
          loadingProfile={loadingProfile}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage user={currentUser} />} />
            <Route 
              path="/auth" 
              element={<AuthPage />} 
            />
            <Route 
              path="/dashboard" 
              element={loadingProfile ? (
                <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-gray-950">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
              ) : currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/donate" 
              element={loadingProfile ? null : currentUser?.role === UserRole.DONOR ? <CreateDonation user={currentUser} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/donations/:id" 
              element={loadingProfile ? null : currentUser ? <DonationDetails user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/donations/edit/:id" 
              element={loadingProfile ? null : currentUser?.role === UserRole.DONOR ? <EditDonation user={currentUser} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/chat/:id" 
              element={loadingProfile ? null : currentUser ? <ChatRoom user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/marketplace" 
              element={loadingProfile ? null : currentUser ? <Marketplace user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/market/create" 
              element={loadingProfile ? null : currentUser ? <CreateMarketItem user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/market/item/:id" 
              element={loadingProfile ? null : currentUser ? <MarketItemDetails user={currentUser} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/market/edit/:id" 
              element={loadingProfile ? null : currentUser ? <EditMarketItem user={currentUser} /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
