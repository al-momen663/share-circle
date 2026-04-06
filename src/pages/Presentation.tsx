
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Database, 
  Code2, 
  Heart, 
  ShoppingBag, 
  MapPin, 
  MessageSquare, 
  LayoutDashboard, 
  Moon, 
  Users,
  Presentation as PresentationIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 'title',
    title: 'Share Circle',
    subtitle: 'Connecting Communities through Giving',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
          <span className="text-white font-black text-5xl">S</span>
        </div>
        <h1 className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 mb-4">
          Share Circle
        </h1>
        <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
          A modern platform for food and clothes donation, bridging the gap between donors and those in need.
        </p>
        <div className="mt-16 flex items-center space-x-4">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Team Name</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">Circle Builders</p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Team Members</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">2 Members</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'stack',
    title: 'Project Stack',
    subtitle: 'Built with Modern Technologies',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full items-center">
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Layers size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4">Frontend Stack</h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400 font-medium">
            <li>React 19</li>
            <li>Vite</li>
            <li>Tailwind CSS v4</li>
            <li>Framer Motion</li>
          </ul>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4">Database</h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400 font-medium">
            <li>Firebase Firestore</li>
            <li>NoSQL Architecture</li>
            <li>Real-time Sync</li>
            <li>Secure Rules</li>
          </ul>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Code2 size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-4">Language</h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400 font-medium">
            <li>TypeScript</li>
            <li>Type Safety</li>
            <li>Modern ES6+</li>
            <li>Clean Architecture</li>
          </ul>
        </motion.div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Core Features',
    subtitle: 'Designed for Impact',
    content: (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 h-full items-center">
        {[
          { icon: <Heart />, title: 'Donations', desc: 'Easy food & clothes listing' },
          { icon: <ShoppingBag />, title: 'Marketplace', desc: 'Community trade hub' },
          { icon: <MapPin />, title: 'Maps & Routing', desc: 'Real-time navigation' },
          { icon: <MessageSquare />, title: 'Live Chat', desc: 'Instant coordination' },
          { icon: <LayoutDashboard />, title: 'Dashboard', desc: 'Unified management' },
          { icon: <Moon />, title: 'Dark Mode', desc: 'Modern visual comfort' },
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start space-x-4"
          >
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              {feature.icon}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">{feature.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: 'showcase-1',
    title: 'Donation & Marketplace',
    subtitle: 'Visual Feature Showcase',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full items-center">
        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border-2 border-emerald-100 dark:border-emerald-800">
            <h3 className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 mb-4">Donation Flow</h3>
            <p className="text-lg text-emerald-700 dark:text-emerald-400 leading-relaxed">
              Donors can list items with photos, descriptions, and precise pickup locations. Volunteers can then claim and deliver these items to those in need.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border-2 border-blue-100 dark:border-blue-800">
            <h3 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-4">Community Market</h3>
            <p className="text-lg text-blue-700 dark:text-blue-400 leading-relaxed">
              A built-in marketplace for selling or trading items within the community, fostering a circular economy and reducing waste.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 aspect-video flex items-center justify-center p-4">
             <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <LayoutDashboard size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-400 font-medium italic">"The Dashboard provides a real-time overview of all active donations and marketplace listings with advanced filtering."</p>
             </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -top-6 -left-6 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    )
  },
  {
    id: 'showcase-2',
    title: 'Maps & Real-time Chat',
    subtitle: 'Advanced Coordination Tools',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full items-center">
        <div className="relative order-2 md:order-1">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 aspect-video flex items-center justify-center p-4">
             <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <MapPin size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-400 font-medium italic">"Interactive maps with OSRM routing allow users to see exactly where items are and how to get there."</p>
             </div>
          </div>
        </div>
        <div className="space-y-6 order-1 md:order-2">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-3xl border-2 border-purple-100 dark:border-purple-800">
            <h3 className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-4">Real-time Coordination</h3>
            <p className="text-lg text-purple-700 dark:text-purple-400 leading-relaxed">
              Integrated chat rooms for every donation and market item. Instant communication ensures smooth pickups and minimizes confusion.
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-3xl border-2 border-orange-100 dark:border-orange-800">
            <h3 className="text-3xl font-bold text-orange-800 dark:text-orange-300 mb-4">Smart Routing</h3>
            <p className="text-lg text-orange-700 dark:text-orange-400 leading-relaxed">
              Automatic geocoding converts addresses to map coordinates, providing visual routes for volunteers and recipients.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'conclusion',
    title: 'Thank You',
    subtitle: 'Join the Circle',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-6xl font-black text-gray-900 dark:text-white mb-8">Questions?</h2>
        <p className="text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          We believe that sharing is the simplest way to build a stronger community.
        </p>
        <div className="flex space-x-6">
          <Link to="/dashboard" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none">
            Launch App
          </Link>
          <button onClick={() => window.location.reload()} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Restart
          </button>
        </div>
        <div className="mt-20 flex items-center space-x-8">
           <div className="flex items-center space-x-2">
              <Users className="text-emerald-600" />
              <span className="font-bold text-gray-600 dark:text-gray-400">2 Team Members</span>
           </div>
           <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
           <div className="flex items-center space-x-2">
              <PresentationIcon className="text-emerald-600" />
              <span className="font-bold text-gray-600 dark:text-gray-400">Share Circle Pitch Deck</span>
           </div>
        </div>
      </div>
    )
  }
];

const Presentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-gray-50 dark:bg-gray-950 overflow-hidden flex flex-col">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800">
        <motion.div 
          className="h-full bg-emerald-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-8 py-6 flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Share Circle Presentation</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-gray-400">Slide {currentSlide + 1} of {slides.length}</span>
          <Link to="/dashboard" className="text-sm font-bold text-emerald-600 hover:underline">Exit Presentation</Link>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-grow relative flex items-center justify-center p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-6xl h-full flex flex-col"
          >
            <div className="mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-black text-gray-900 dark:text-white mb-2"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </div>
            <div className="flex-grow">
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-12 py-8 flex justify-between items-center bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition ${currentSlide === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <ChevronLeft />
          <span>Previous</span>
        </button>
        
        <div className="flex space-x-2">
          {slides.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition ${currentSlide === i ? 'bg-emerald-600 scale-125' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition ${currentSlide === slides.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none'}`}
        >
          <span>Next</span>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Presentation;
