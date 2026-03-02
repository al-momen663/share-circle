import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { MarketCategory, MarketItemStatus, User, MarketItem } from '../types';
interface EditMarketItemProps {
  user: User;
}
const EditMarketItem: React.FC<EditMarketItemProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: MarketCategory.FOOD,
    location: '',
    imageUrl: '',
    status: MarketItemStatus.AVAILABLE
  });
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'market_items', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as MarketItem;
          if (data.sellerId !== user.id) {
            alert("You are not authorized to edit this item.");
            navigate('/marketplace');
            return;
          }
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price.toString(),
            originalPrice: data.originalPrice ? data.originalPrice.toString() : '',
            category: data.category,
            location: data.location,
            imageUrl: data.imageUrl,
            status: data.status
          });
          setImagePreview(data.imageUrl);
        } else {
          navigate('/marketplace');
        }
      } catch (error) {
        console.error("Error fetching market item:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchItem();
  }, [id, user.id, navigate]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        const storageRef = ref(storage, `market_items/${Date.now()}_${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        finalImageUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (error) => reject(error), 
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL);
              });
            }
          );
        });
      }
      const docRef = doc(db, 'market_items', id);
      await updateDoc(docRef, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        status: formData.status,
        location: formData.location,
        imageUrl: finalImageUrl,
        updatedAt: Date.now()
      });
      navigate(`/market/item/${id}`);
    } catch (error) {
      console.error("Error updating market item:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="bg-emerald-600 p-8 text-white">
            <h1 className="text-3xl font-extrabold mb-2">Edit Market Item</h1>
            <p className="text-emerald-100 opacity-90">Update your listing details for the community.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Item Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Fresh Organic Tomatoes"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition-all text-gray-900 dark:text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition-all text-gray-900 dark:text-white"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Original ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition-all text-gray-900 dark:text-white"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</label>
              <textarea
                required
                rows={4}
                placeholder="Tell buyers about the quality, quantity, and condition..."
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition-all text-gray-900 dark:text-white resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition-all text-gray-900 dark:text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MarketCategory })}
                >
                  <option value={MarketCategory.FOOD}>Food</option>
                  <option value={MarketCategory.GROCERY}>Grocery</option>
                  <option value={MarketCategory.FURNITURE}>Furniture</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition-all text-gray-900 dark:text-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MarketItemStatus })}
                >
                  <option value={MarketItemStatus.AVAILABLE}>Available</option>
                  <option value={MarketItemStatus.SOLD}>Sold</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Location</label>
              <input
                required
                type="text"
                placeholder="e.g. Downtown, NY"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition-all text-gray-900 dark:text-white"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>