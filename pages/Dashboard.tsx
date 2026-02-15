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
// Define DashboardProps interface
interface DashboardProps {
  user: User;
}

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

	  {/* Content Area */}
      <div className="min-h-[500px]">
        {viewMode === 'grid' ? (
          filteredDonations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-20 text-center shadow-sm border border-gray-100 dark:border-gray-700 mt-4 animate-in fade-in duration-500">
              <div className="text-6xl mb-6">🏜️</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">The circle is quiet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">No donations match your current filters. Try adjusting your search or status.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
              {filteredDonations.map((donation) => (
                <Link 
                  to={`/donations/${donation.id}`} 
                  key={donation.id} 
                  className="group bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col hover:-translate-y-2 animate-in slide-in-from-bottom-4 duration-300"
                >
                  <div className="relative h-56">
                    <img 
                      src={donation.imageUrl} 
                      alt={donation.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg ${
                        donation.type === DonationType.FOOD ? 'bg-white/90 text-orange-600 backdrop-blur-md' : 'bg-white/90 text-blue-600 backdrop-blur-md'
                      }`}>
                        {donation.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 flex-grow">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight truncate">{donation.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <span className="mr-2 opacity-70">📍</span>
                      <span className="truncate">{donation.location}</span>
                    </div>
                    <div className="pt-6 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img src={`https://ui-avatars.com/api/?name=${donation.donorName}&background=random`} className="w-8 h-8 rounded-lg" alt="Donor avatar" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{donation.donorName}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        donation.status === DonationStatus.AVAILABLE ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {donation.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-950 mt-4 relative animate-in fade-in duration-500">
             <MapContainer 
                center={mapCenter} 
                zoom={13} 
                scrollWheelZoom={true} 
                className="z-0 w-full h-full"
             >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                <MapController center={mapCenter} />
                {filteredDonations.map((d) => {
                  const pos = parseLatLng(d.location);
                  // Only show markers that parsed correctly (not the default if the address was just text)
                  return (
                    <Marker 
                        key={d.id} 
                        position={pos}
                        icon={d.type === DonationType.FOOD ? foodIcon : clothesIcon}
                    >
                        <Popup>
                            <div className="p-1 min-w-[200px]">
                                <img src={d.imageUrl} className="w-full h-24 object-cover rounded-xl mb-3 shadow-sm" alt="Donation" />
                                <h4 className="font-black text-gray-900 text-lg mb-1 leading-tight">{d.title}</h4>
                                <p className="text-xs text-gray-500 mb-3 truncate">📍 {d.location}</p>
                                <div className="flex justify-between items-center mb-3">
                                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                        d.status === DonationStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {d.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <Link 
                                    to={`/donations/${d.id}`}
                                    className="block w-full text-center bg-emerald-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                                >
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                  )
                })}
             </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;