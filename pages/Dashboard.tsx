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
};