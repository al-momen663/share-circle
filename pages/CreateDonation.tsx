import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, DonationType, DonationStatus } from '../types';
import { GoogleGenAI } from "@google/genai";

interface CreateDonationProps {
  user: User;
}

const CreateDonation: React.FC<CreateDonationProps> = ({ user }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DonationType>(DonationType.FOOD);
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAssist = async () => {
    if (!title) {
      alert("Please enter a title first!");
      return;
    }
    
    setAiLoading(true);
    try {
      // Fix: Exclusively use process.env.API_KEY directly in the constructor as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a warm, concise, and helpful description for a donation item.
          Title: ${title}
          Type: ${type}
          Keep it under 60 words and emphasize the positive impact.`,
      });
      
      // Fix: Use response.text property directly (not as a method)
      const aiText = response.text;
      if (aiText) {
        setDescription(aiText.trim());
      }
    } catch (error: any) {
      console.error("Gemini AI Assist error", error);
      alert("AI Assistant is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}),
        () => alert("Location access denied. Please enter manually.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
