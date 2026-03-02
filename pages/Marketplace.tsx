import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarketItem, MarketItemStatus, User } from '../types';

interface MarketplaceProps {
  user: User | null;
}
const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'FOOD' | 'GROCERY' | 'FURNITURE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsRef = collection(db, 'market_items');
        let q = query(
          itemsRef, 
          where('status', '==', MarketItemStatus.AVAILABLE)
        );

        if (filter !== 'ALL') {
          q = query(
            itemsRef,
            where('status', '==', MarketItemStatus.AVAILABLE),
            where('category', '==', filter)
          );
        }

        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MarketItem[];
        
        // Sort client-side to avoid index requirement
        const sortedItems = fetchedItems.sort((a, b) => b.createdAt - a.createdAt);
        setItems(sortedItems);
      } catch (error) {
        console.error("Error fetching market items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filter]);
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );