
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserRole, Donation, DonationStatus } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2, Info } from 'lucide-react';
import { formatLocation } from '../lib/utils';

// Fix Leaflet marker icon issue
import 'leaflet/dist/leaflet.css';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface DonationDetailsProps {
  user: User;
}

// Component to auto-fit map to markers
const MapBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

const DonationDetails: React.FC<DonationDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'donations', id), (docSnap) => {
      if (docSnap.exists()) {
        setDonation({ id: docSnap.id, ...docSnap.data() } as Donation);
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const geocode = async (address: string) => {
      // Check if it's already a coordinate
      const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
      const match = address.match(coordRegex);
      if (match) {
        return [parseFloat(match[1]), parseFloat(match[3])] as [number, number];
      }

      try {
        // Try Photon (Komoot) first - faster and more lenient CORS
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const f = data.features[0];
            return [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number];
          }
        }
        
        // Try Nominatim as fallback
        const nomResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        if (nomResponse.ok) {
          const data = await nomResponse.json();
          if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
      return null;
    };

    const fetchRoute = async (start: [number, number], end: [number, number]) => {
      setLoadingRoute(true);
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRoute(coordinates);
        }
      } catch (error) {
        console.error("Routing error:", error);
      } finally {
        setLoadingRoute(false);
      }
    };

    const processLocations = async () => {
      if (!donation) return;
      
      // Only geocode if we don't have coords yet or if locations changed
      // Using a ref or just checking current state is tricky with async, 
      // so we'll just check if the location strings match what we last processed.
      
      const pCoords = await geocode(donation.pickupLocation);
      setPickupCoords(pCoords);

      let dCoords: [number, number] | null = null;
      if (donation.dropoffLocation) {
        dCoords = await geocode(donation.dropoffLocation);
        setDropoffCoords(dCoords);
      }

      if (pCoords && dCoords) {
        fetchRoute(pCoords, dCoords);
      }
    };

    processLocations();
  }, [donation?.pickupLocation, donation?.dropoffLocation]); // Only run when locations change

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

  const mapPoints: [number, number][] = [];
  if (pickupCoords) mapPoints.push(pickupCoords);
  if (dropoffCoords) mapPoints.push(dropoffCoords);

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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Type</h4>
                  <p className="font-bold text-gray-900 dark:text-gray-200 capitalize">{donation.type.toLowerCase()}</p>
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

          {/* Map Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
                <Navigation className="mr-2 text-emerald-600" />
                Location & Directions
              </h2>
              {loadingRoute && <Loader2 className="animate-spin text-emerald-600" size={20} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 flex items-center">
                  <MapPin size={12} className="mr-1" /> Pickup Location
                </h4>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{formatLocation(donation.pickupLocation)}</p>
              </div>
              {donation.dropoffLocation && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                  <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-1 flex items-center">
                    <MapPin size={12} className="mr-1" /> Drop-off Location
                  </h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{formatLocation(donation.dropoffLocation)}</p>
                </div>
              )}
            </div>

            <div className="h-96 rounded-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700">
              {pickupCoords ? (
                <MapContainer 
                  center={pickupCoords} 
                  zoom={13} 
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={pickupCoords}>
                    <Popup>Pickup: {donation.pickupLocation}</Popup>
                  </Marker>
                  {dropoffCoords && (
                    <Marker position={dropoffCoords}>
                      <Popup>Drop-off: {donation.dropoffLocation}</Popup>
                    </Marker>
                  )}
                  {route.length > 0 && (
                    <Polyline positions={route} color="#10b981" weight={5} opacity={0.7} />
                  )}
                  <MapBounds points={mapPoints} />
                </MapContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
                  <Loader2 className="animate-spin mb-2" />
                  <p className="text-sm">Loading map...</p>
                </div>
              )}
            </div>
            
            <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-xs text-gray-500 dark:text-gray-400">
              <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>Directions are estimated using OSRM. Please follow local traffic rules and safety guidelines during transport.</p>
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
                <div className="space-y-4">
                  <Link 
                    to={`/donations/edit/${donation.id}`}
                    className="w-full py-4 flex justify-center items-center bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-none"
                  >
                    Edit Donation
                  </Link>
                  <button 
                    onClick={() => updateStatus(DonationStatus.CANCELLED)}
                    className="w-full py-4 bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/50 rounded-2xl font-black hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    Cancel Posting
                  </button>
                </div>
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
