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