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