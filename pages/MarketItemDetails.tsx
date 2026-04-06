
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarketItem, MarketItemStatus, User } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ShoppingBag, Loader2, Navigation } from 'lucide-react';
import { formatLocation } from '../lib/utils';

// Component to handle map re-centering and fixing gray tiles
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  useEffect(() => {
    // Fix gray tiles by forcing Leaflet to recalculate container size
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    const container = map.getContainer();
    resizeObserver.observe(container);

    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [map]);
  
  return null;
};

interface MarketItemDetailsProps {
  user: User;
}

const MarketItemDetails: React.FC<MarketItemDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'market_items', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const itemData = { id: docSnap.id, ...docSnap.data() } as MarketItem;
          setItem(itemData);
          
          // Geocode location
          const address = itemData.location;
          // Check if it's already a coordinate
          const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
          const match = address.match(coordRegex);
          if (match) {
            setCoords([parseFloat(match[1]), parseFloat(match[3])]);
          } else {
            try {
              // Try Photon (Komoot) first - faster and more lenient CORS
              const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
              if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                  const f = data.features[0];
                  setCoords([f.geometry.coordinates[1], f.geometry.coordinates[0]]);
                } else {
                  throw new Error('No results from Photon');
                }
              } else {
                throw new Error('Photon error');
              }
            } catch (error) {
              console.error("Photon geocoding failed, trying Nominatim:", error);
              try {
                const nomResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
                if (nomResponse.ok) {
                  const data = await nomResponse.json();
                  if (data && data.length > 0) {
                    setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                  }
                }
              } catch (nomError) {
                console.error("Nominatim geocoding also failed:", nomError);
              }
            }
          }
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
      
      // Create a notification or message for the seller
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
              <img 
                src={item.imageUrl || 'https://picsum.photos/seed/food/800/600'} 
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-6 left-6 bg-emerald-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-widest">
                {item.category}
              </div>
            </div>

            <div className="p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{item.title}</h1>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 block">${item.price.toFixed(2)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xl">
                    {item.sellerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Seller</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{item.sellerName}</p>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{item.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                      <span className="font-medium">{formatLocation(item.location)}</span>
                    </div>
                    
                    <div className="h-64 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
                      {coords ? (
                        <MapContainer 
                          center={coords} 
                          zoom={13} 
                          className="h-full w-full"
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={coords}>
                            <Popup>{item.location}</Popup>
                          </Marker>
                          <MapController center={coords} />
                        </MapContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400">
                          <Loader2 className="animate-spin mb-2" />
                          <p className="text-xs uppercase tracking-widest font-bold">Loading Map...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                {item.status === MarketItemStatus.AVAILABLE ? (
                  isSeller ? (
                    <div className="space-y-4">
                      <Link 
                        to={`/market/edit/${item.id}`}
                        className="w-full flex justify-center items-center bg-emerald-600 text-white px-8 py-5 rounded-2xl font-bold text-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none"
                      >
                        Edit Listing
                      </Link>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-emerald-700 dark:text-emerald-300 font-medium text-center">
                        This is your listing. You'll be notified when someone buys it.
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleBuy}
                      disabled={actionLoading}
                      className="w-full bg-emerald-600 text-white px-8 py-5 rounded-2xl font-bold text-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Buy Now'}
                    </button>
                  )
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl text-gray-500 dark:text-gray-400 font-bold text-center text-xl uppercase tracking-widest">
                    Sold Out
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketItemDetails;
