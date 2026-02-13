import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	auth,
	db
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

const AuthPage: React.FC = () => {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(true);
	const [role, setRole] = useState<UserRole>(UserRole.DONOR);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showOptions, setShowOptions] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleAuthSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			if (isLogin) {
				// Fix: Use modular signInWithEmailAndPassword with auth instance
				await signInWithEmailAndPassword(auth, email, password);
				// On successful login, show view options
				setShowOptions(true);
			} else {
				// Fix: Use modular createUserWithEmailAndPassword with auth instance
				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				const fbUser = userCredential.user;

				// Save user details to Firestore
				await setDoc(doc(db, 'users', fbUser.uid), {
					name,
					email,
					role,
					avatar: `https://ui-avatars.com/api/?name=${name || 'K'}&background=10b981&color=fff&bold=true`
				});

				setShowOptions(true);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};
	const handleFinalLogin = (viewType: 'grid' | 'map') => {
    localStorage.setItem('share_circle_initial_view', viewType);
    navigate('/dashboard');
  };
  return {
	<div className={`min-h-screen flex items-center justify-center py-12 px-6 lg:px-8 bg-emerald-50 dark:bg-gray-950 transition-all duration-700 ${showOptions ? 'bg-emerald-100 dark:bg-emerald-950' : ''}`}>
      <div className={`max-w-md w-full auth-card ${showOptions ? 'show-options' : ''}`}>
        <div className="auth-card-inner relative w-full h-[640px]">
		
		{/* Front Side: Auth Form */}
          <div className="auth-front absolute inset-0 bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-emerald-200 dark:shadow-none">
                <span className="text-white font-bold">S</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {isLogin ? 'Enter Share Circle' : 'Join the Circle'}
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium text-xs italic">
                {isLogin ? 'Welcome back, friend.' : 'A community that shares together.'}
              </p>
            </div>
			{error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl text-center">
                {error}
              </div>
            )}
            
            <form className="mt-6 space-y-4 flex-grow" onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 text-center">Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.DONOR)}
                      className={`py-2.5 rounded-xl border-2 font-black text-xs transition ${
                        role === UserRole.DONOR 
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                        : 'border-gray-100 dark:border-gray-700 text-gray-400'
                      }`}
                    >
                      Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.VOLUNTEER)}
                      className={`py-2.5 rounded-xl border-2 font-black text-xs transition ${
                        role === UserRole.VOLUNTEER 
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                        : 'border-gray-100 dark:border-gray-700 text-gray-400'
                      }`}
                    >
                      Volunteer
                    </button>
                  </div>
                </div>
              )}
			   <div className="space-y-3">
                {!isLogin && (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white text-sm"
                    placeholder="Full Name"
                  />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white text-sm"
                  placeholder="Email Address"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white text-sm"
                    placeholder="Password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black uppercase tracking-wider"
                  >
                    {showPassword ? 'Hide' : 'View'}
                  </button>
                </div>
              </div>
			  <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Enter App' : 'Create Account')}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-widest"
                >
                  {isLogin ? "New here? Get started" : "Already registered? Login"}
                </button>
              </div>
            </form>
          </div>
		  {/* Back Side: View Options */}
          <div className="auth-back absolute inset-0 bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2">Login Successful!</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-xs">How would you like to explore the circle today?</p>
            
            <div className="grid grid-cols-1 gap-3 w-full">
              <button
                onClick={() => handleFinalLogin('grid')}
                className="group w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent hover:border-emerald-500 transition-all text-left flex items-center space-x-5 shadow-sm"
              >
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">🗂️</div>
                <div>
                  <p className="font-black text-sm text-gray-900 dark:text-white">Grid View</p>
                  <p className="text-[10px] text-gray-400">Standard card layout</p>
                </div>
              </button>

              <button
                onClick={() => handleFinalLogin('map')}
                className="group w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent hover:border-emerald-500 transition-all text-left flex items-center space-x-5 shadow-sm"
              >
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">🗺️</div>
                <div>
                  <p className="font-black text-sm text-gray-900 dark:text-white">Map View</p>
                  <p className="text-[10px] text-gray-400">Discover items nearby</p>
                </div>
              </button>
              
              <button
                onClick={() => setShowOptions(false)}
                className="mt-6 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                ← Back to Login
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
  
};

export default AuthPage;