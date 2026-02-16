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