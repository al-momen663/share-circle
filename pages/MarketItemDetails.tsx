import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarketItem, MarketItemStatus, User } from '../types';

interface MarketItemDetailsProps {
  user: User;
}
const MarketItemDetails: React.FC<MarketItemDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'market_items', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() } as MarketItem);
        } else {
          navigate('/marketplace');
        }
      } catch (error) {
        console.error("Error fetching market item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);
  const handleBuy = async () => {
    if (!item || !id) return;
    setActionLoading(true);
    try {
      const docRef = doc(db, 'market_items', id);
      await updateDoc(docRef, {
        status: MarketItemStatus.SOLD,
        buyerId: user.id,
        buyerName: user.name,
        soldAt: Date.now()
      });
      
      await addDoc(collection(db, 'messages'), {
        marketItemId: id,
        senderId: user.id,
        text: `Hi ${item.sellerName}, I'm interested in buying your ${item.title}. I've marked it as sold!`,
        timestamp: Date.now()
      });

      alert("Success! You've purchased this item. You can now chat with the seller.");
      navigate(`/chat/${id}?type=market`);
    } catch (error) {
      console.error("Error buying item:", error);
      alert("Failed to purchase item. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!item) return null;
  const isSeller = item.sellerId === user.id;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/marketplace" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold mb-8 hover:underline group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Marketplace
        </Link>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-96 lg:h-full overflow-hidden">
              <img src={item.imageUrl || 'https://picsum.photos/seed/food/800/600'} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-6 left-6 bg-emerald-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-widest">
                {item.category}
              </div>
            </div>