import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../types';

interface LandingPageProps {
  user: User | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 mb-6">
                Small acts, big impact.
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
                Spread Kindness <br />
                <span className="text-emerald-600 dark:text-emerald-400">Join the Circle</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
                Share Circle is the easiest way to donate excess food and clothes. We bridge the gap between donors and volunteers to strengthen our local communities.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                <Link to={user ? "/dashboard" : "/auth"} className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 dark:shadow-none transition transform hover:-translate-y-1">
                  {user ? "Go to Dashboard" : "Start Sharing"}
                </Link>
                <Link to="/auth" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition transform hover:-translate-y-1">
                  Become a Volunteer
                </Link>
              </div>
            </div>
            <div className="mt-16 lg:mt-0 relative">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800" 
                alt="Donation box" 
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Feature Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How Share Circle Works</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-16">Simple steps to make the world a better place.</p>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Donors List Items',
                desc: 'Capture photos and add details of food or clothes you wish to donate.',
                icon: '📸',
                color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              },
              {
                title: 'Volunteers Pick Up',
                desc: 'Local volunteers see available donations and claim them for delivery.',
                icon: '🚚',
                color: 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400'
              },
              {
                title: 'Safe Delivery',
                desc: 'Live chat ensures coordination until the donation reaches someone in need.',
                icon: '🎁',
                color: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;