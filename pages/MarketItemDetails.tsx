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