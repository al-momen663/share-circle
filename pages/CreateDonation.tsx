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
        <form onSubmit={handleSubmit} className="flex-grow p-12 space-y-6 overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Donation Title</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fresh Organic Apples"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setType(DonationType.FOOD)} className={py-4 rounded-2xl border-2 font-black transition ${type === DonationType.FOOD ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400'}}>🍎 Food</button>
            <button type="button" onClick={() => setType(DonationType.CLOTHES)} className={py-4 rounded-2xl border-2 font-black transition ${type === DonationType.CLOTHES ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400'}}>👕 Clothes</button>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Pickup Location / Address</label>
            <div className="relative">
              <input 
                type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter street address or lat, lng..."
                className="w-full pl-6 pr-28 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
              />
              <button 
                type="button" 
                onClick={handleGetLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition"
              >
                📍 GPS
              </button>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-medium italic">Tip: GPS coordinates work best for the map!</p>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Item Photo</label>
            <div onClick={() => document.getElementById('photo-input')?.click()} className="relative border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-3xl h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden cursor-pointer hover:border-emerald-400 transition">
              {image ? <img src={image} className="absolute inset-0 w-full h-full object-cover" /> : <div className="text-center"><span className="text-3xl block mb-2">📸</span><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tap to upload</span></div>}
              <input id="photo-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Description</label>
              <button type="button" onClick={handleAiAssist} disabled={aiLoading} className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full hover:bg-emerald-200 transition">{aiLoading ? '✨' : '✨ AI Assist'}</button>
            </div>
            <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us more about the donation..." className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-emerald-700 shadow-xl disabled:opacity-50 transition active:scale-[0.98]">
            {loading ? 'Publishing...' : 'Publish Donation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDonation;
