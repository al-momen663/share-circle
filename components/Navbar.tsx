import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}
const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isDark, onToggleTheme }) => {
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-[1000] border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Share Circle</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">Home</Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition">Dashboard</Link>
                {user.role === UserRole.DONOR && (
                  <Link to="/donate" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-none">
                    Donate
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-5">
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition"
              title="Toggle Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium capitalize">{user.role.toLowerCase()}</p>
                </div>
                <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-xl ring-2 ring-emerald-100 dark:ring-emerald-900 object-cover" />
                <button 
                  onClick={() => { onLogout(); navigate('/'); }}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;