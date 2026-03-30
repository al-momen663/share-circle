
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, DonationType, DonationStatus, Donation } from '../types';
import { GoogleGenAI } from "@google/genai";
import LocationSearch from '../components/LocationSearch';
import { Camera, Sparkles, Loader2 } from 'lucide-react';

interface EditDonationProps {
  user: User;
}

const EditDonation: React.FC<EditDonationProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DonationType>(DonationType.FOOD);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<DonationStatus>(DonationStatus.AVAILABLE);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'donations', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Donation;
          if (data.donorId !== user.id) {
            alert("You are not authorized to edit this donation.");
            navigate('/dashboard');
            return;
          }
          setTitle(data.title);
          setDescription(data.description);
          setType(data.type);
          setPickupLocation(data.pickupLocation);
          setDropoffLocation(data.dropoffLocation || '');
          setImage(data.imageUrl);
          setStatus(data.status);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching donation:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchDonation();
  }, [id, user.id, navigate]);

  const handleAiAssist = async () => {
    if (!title) {
      alert("Please enter a title first!");
      return;
    }
    
    setAiLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a warm, concise, and helpful description for a donation item.
          Title: ${title}
          Type: ${type}
          Keep it under 60 words and emphasize the positive impact.`,
      });
      
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
        (pos) => setPickupLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        () => alert("Location access denied. Please enter manually.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!pickupLocation.trim()) {
      alert("Please provide a pickup location.");
      return;
    }
    setLoading(true);

    try {
      const docRef = doc(db, 'donations', id);
      await updateDoc(docRef, {
        title,
        description,
        type,
        status,
        pickupLocation,
        dropoffLocation: dropoffLocation || null,
        imageUrl: image,
        updatedAt: Date.now()
      });
      navigate(`/donations/${id}`);
    } catch (err) {
      console.error("Error updating donation", err);
      alert("Failed to update donation. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
        <div className="md:w-1/3 bg-emerald-600 p-12 text-white flex flex-col justify-between">
            <div>
                <h1 className="text-4xl font-black mb-6 leading-tight">Edit Your <br/> Donation</h1>
                <p className="opacity-90 text-emerald-50 leading-relaxed mb-10">Update the details of your contribution to keep the community informed.</p>
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
            <button type="button" onClick={() => setType(DonationType.FOOD)} className={`py-4 rounded-2xl border-2 font-black transition ${type === DonationType.FOOD ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400'}`}>🍎 Food</button>
            <button type="button" onClick={() => setType(DonationType.CLOTHES)} className={`py-4 rounded-2xl border-2 font-black transition ${type === DonationType.CLOTHES ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400'}`}>👕 Clothes</button>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as DonationStatus)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
            >
              <option value={DonationStatus.AVAILABLE}>Available</option>
              <option value={DonationStatus.PICKED_UP}>Picked Up</option>
              <option value={DonationStatus.DELIVERED}>Delivered</option>
              <option value={DonationStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <LocationSearch 
                label="Pickup Location / Address"
                value={pickupLocation}
                onChange={setPickupLocation}
                placeholder="Search for pickup address..."
              />
              <button 
                type="button" 
                onClick={handleGetLocation}
                className="absolute right-2 top-11 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition"
              >
                📍 GPS
              </button>
            </div>

            <LocationSearch 
              label="Drop-off Location (Optional)"
              value={dropoffLocation}
              onChange={setDropoffLocation}
              placeholder="Search for drop-off address (e.g., local charity)..."
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Item Photo</label>
            <div onClick={() => document.getElementById('photo-input')?.click()} className="relative border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-3xl h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden cursor-pointer hover:border-emerald-400 transition">
              {image ? <img src={image} className="absolute inset-0 w-full h-full object-cover" /> : <div className="text-center"><Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" /><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tap to upload</span></div>}
              <input id="photo-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Description</label>
              <button type="button" onClick={handleAiAssist} disabled={aiLoading} className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full hover:bg-emerald-200 transition flex items-center space-x-1">
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>{aiLoading ? 'Generating...' : 'AI Assist'}</span>
              </button>
            </div>
            <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us more about the donation..." className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white resize-none" />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(`/donations/${id}`)} className="flex-1 py-5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-[1.5rem] font-black text-xl hover:bg-gray-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-emerald-700 shadow-xl disabled:opacity-50 transition active:scale-[0.98]">
              {loading ? 'Updating...' : 'Update Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDonation;
