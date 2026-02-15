import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Message, Donation } from '../types';
// Import Gemini API
import { GoogleGenAI } from "@google/genai";