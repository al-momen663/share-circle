import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserRole, Donation, DonationStatus, DonationType } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const foodIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3194/3194591.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
});

const clothesIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3531/3531844.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
});

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
    
    // Fix gray tiles by forcing Leaflet to recalculate container size
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    const container = map.getContainer();
    resizeObserver.observe(container);

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => resizeObserver.disconnect();
  }, [center, map]);
  return null;
};
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
    
    // Fix gray tiles by forcing Leaflet to recalculate container size
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    const container = map.getContainer();
    resizeObserver.observe(container);

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => resizeObserver.disconnect();
  }, [center, map]);
  return null;
};
const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filter, setFilter] = useState<DonationStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>(() => {
    return (localStorage.getItem('share_circle_initial_view') as 'grid' | 'map') || 'grid';
  });

  useEffect(() => {
    let q;
    if (user.role === UserRole.DONOR) {
      q = query(
        collection(db, 'donations'), 
        where('donorId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'donations'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[];
      
      if (user.role === UserRole.VOLUNTEER) {
        setDonations(docs.filter(d => d.status === DonationStatus.AVAILABLE || d.volunteerId === user.id));
      } else {
        setDonations(docs);
      }
    });

    return () => unsubscribe();
  }, [user.id, user.role]);

  const filteredDonations = donations.filter(d => {
    const statusMatch = filter === 'ALL' || d.status === filter;
    const searchMatch = d.title.toLowerCase().includes(search.toLowerCase()) || 
                       d.location.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const parseLatLng = (loc: string): [number, number] => {
    if (!loc) return [51.505, -0.09];
    // Regex to handle "lat, lng", "lat lng", or simple floats
    const matches = loc.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/) || loc.match(/(-?\d+\.\d+)\s+(-?\d+\.\d+)/);
    if (matches) return [parseFloat(matches[1]), parseFloat(matches[2])];
    return [51.505, -0.09]; 
  };
  // Determine map center based on filtered donations or default
  const mapCenter = filteredDonations.length > 0 
    ? parseLatLng(filteredDonations[0].location) 
    : [51.505, -0.09] as [number, number];

  const statusOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Available', value: DonationStatus.AVAILABLE },
    { label: 'Picked Up', value: DonationStatus.PICKED_UP },
    { label: 'Delivered', value: DonationStatus.DELIVERED },
    { label: 'Cancelled', value: DonationStatus.CANCELLED },
  ];
  return (
	<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">
		{/* Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">Share Circle <br/> Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.role === UserRole.DONOR 
              ? `Helping hearts grow, one share at a time, ${user.name.split(' ')[0]}.` 
              : `Ready to connect and serve, ${user.name.split(' ')[0]}?`}
          </p>
        </div>
		 <div className="flex space-x-4 lg:col-span-2 lg:justify-end">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex-1 lg:flex-none lg:w-32 shadow-sm text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">In Circle</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{donations.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex-1 lg:flex-none lg:w-32 shadow-sm text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Available</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {donations.filter(d => d.status === DonationStatus.AVAILABLE).length}
                </p>
            </div>
            {user.role === UserRole.DONOR && (
                <Link to="/donate" className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 py-4 font-bold transition shadow-xl shadow-emerald-200 dark:shadow-none">
                   + New Donation
                </Link>
            )}
        </div>
      </div>
	  {/* Controls */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="w-full lg:w-96 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search donation or location..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

			  {/* View Mode Switcher */}
            <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${viewMode === 'grid' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <span>🗂️</span> <span>Grid</span>
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${viewMode === 'map' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <span>🗺️</span> <span>Map</span>
                </button>
            </div>
        </div>
		 {/* Status Filters */}
        <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Filter Status:</span>
            {statusOptions.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition border ${
                        filter === opt.value 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-500'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
      </div>
};