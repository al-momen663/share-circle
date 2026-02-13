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