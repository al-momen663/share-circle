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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("Please provide a pickup location.");
      return;
    }
    setLoading(true);

    try {
      await addDoc(collection(db, 'donations'), {
        donorId: user.id,
        donorName: user.name,
        title,
        description,
        type,
        status: DonationStatus.AVAILABLE,
        location,
        imageUrl: image || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
        createdAt: Date.now()
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error adding donation", err);
      alert("Failed to publish donation. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
        <div className="md:w-1/3 bg-emerald-600 p-12 text-white flex flex-col justify-between">
            <div>
                <h1 className="text-4xl font-black mb-6 leading-tight">Share Your <br/> Abundance</h1>
                <p className="opacity-90 text-emerald-50 leading-relaxed mb-10">Help your neighbors by sharing what you no longer need.</p>
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">📸</div>
                        <span className="font-bold">Photos</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">📍</div>
                        <span className="font-bold">Location</span>
                    </div>
                </div>
            </div>
            <div className="mt-12 opacity-50 text-xs font-bold uppercase tracking-widest text-center">Share Circle</div>
        </div>
