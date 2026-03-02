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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Marketplace</h1>
            <p className="text-gray-600 dark:text-gray-400">Buy and sell fresh food, groceries, and furniture within your community.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search items..."
                className="pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white shadow-sm w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link 
              to="/market/create" 
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none whitespace-nowrap"
            >
              Sell Item
            </Link>
          </div>
        </div>
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {['ALL', 'FOOD', 'GROCERY', 'FURNITURE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-6 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
  <div className="flex justify-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
  </div>
) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => {
              const discount = item.originalPrice && item.originalPrice > item.price 
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;

              return (
                <Link 
                  key={item.id} 
                  to={`/market/item/${item.id}`}
                  className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={item.imageUrl || `https://picsum.photos/seed/${item.category.toLowerCase()}/400/300`} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-black text-xs shadow-lg animate-pulse">
                        {discount}% OFF
                      </div>
                    )}

                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-sm">
                      ${item.price.toFixed(2)}
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="ml-2 text-[10px] text-gray-400 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xs">
                          {item.sellerName.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {item.sellerName}
                        </span>
                      </div>

                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (

          