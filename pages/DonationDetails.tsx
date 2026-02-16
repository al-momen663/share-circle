import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserRole, Donation, DonationStatus } from '../types';

interface DonationDetailsProps {
  user: User;
}
const DonationDetails: React.FC<DonationDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [donation, setDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'donations', id), (docSnap) => {
      if (docSnap.exists()) {
        setDonation({ id: docSnap.id, ...docSnap.data() } as Donation);
      }
    });
    return () => unsubscribe();
  }, [id]);
  const updateStatus = async (newStatus: DonationStatus, volunteerId?: string) => {
    if (!donation || !id) return;
    try {
      const data: any = { status: newStatus };
      if (volunteerId) data.volunteerId = volunteerId;
      await updateDoc(doc(db, 'donations', id), data);
    } catch (err) {
      console.error("Update status error", err);
      alert("Failed to update status.");
    }
  };

  if (!donation) return <div className="p-10 text-center dark:text-white">Loading donation details...</div>;

  const isDonor = donation.donorId === user.id;
  const isVolunteer = user.role === UserRole.VOLUNTEER;
  const isClaimedByMe = donation.volunteerId === user.id;
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/dashboard" className="text-emerald-600 dark:text-emerald-400 font-bold mb-6 inline-block hover:underline">← Back to Dashboard</Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <img src={donation.imageUrl} alt={donation.title} className="w-full h-96 object-cover" />
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">{donation.title}</h1>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  donation.status === DonationStatus.AVAILABLE ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {donation.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 whitespace-pre-wrap leading-relaxed">{donation.description}</p>
              
              <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Type</h4>
                  <p className="font-bold text-gray-900 dark:text-gray-200 capitalize">{donation.type.toLowerCase()}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Location</h4>
                  <p className="font-bold text-gray-900 dark:text-gray-200 truncate">{donation.location}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Posted On</h4>
                  <p className="font-bold text-gray-900 dark:text-gray-200">{new Date(donation.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Donor</h4>
                  <p className="font-bold text-gray-900 dark:text-gray-200">{donation.donorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Action Center</h2>
            
            <div className="space-y-4">
              {donation.status === DonationStatus.AVAILABLE && isVolunteer && !isDonor && (
                <button 
                  onClick={() => updateStatus(DonationStatus.PICKED_UP, user.id)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-none"
                >
                  Claim & Pick Up
                </button>
              )}

              {donation.status === DonationStatus.PICKED_UP && isClaimedByMe && (
                <button 
                  onClick={() => updateStatus(DonationStatus.DELIVERED)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-none"
                >
                  Mark as Delivered
                </button>
              )}

              {(isClaimedByMe || isDonor) && donation.status !== DonationStatus.AVAILABLE && (
                <Link 
                  to={`/chat/${donation.id}`}
                  className="w-full py-4 flex justify-center items-center bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-600 dark:border-emerald-900 rounded-2xl font-black hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition shadow-sm"
                >
                  <span className="mr-2">💬</span> Coordination Chat
                </Link>
              )}

              {isDonor && donation.status === DonationStatus.AVAILABLE && (
                <button 
                  onClick={() => updateStatus(DonationStatus.CANCELLED)}
                  className="w-full py-4 bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/50 rounded-2xl font-black hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  Cancel Posting
                </button>
              )}

              {donation.status === DonationStatus.DELIVERED && (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-2xl text-center font-black border border-emerald-100 dark:border-emerald-900">
                  ✅ Successfully Delivered!
                </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-900 dark:bg-emerald-950 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10">🌱</div>
            <h3 className="font-black text-xl mb-4">The Impact</h3>
            <p className="text-emerald-100 text-sm opacity-80 leading-relaxed font-medium">
              Every item shared within the Circle reduces waste and provides immediate support to your neighbors. Your kindness is contagious.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DonationDetails;