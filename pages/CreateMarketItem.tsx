import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { MarketCategory, MarketItemStatus, User } from '../types';
interface CreateMarketItemProps {
  user: User;
}

const CreateMarketItem: React.FC<CreateMarketItemProps> = ({ user }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
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
    imageUrl: ''
  });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    let finalImageUrl = formData.imageUrl;

    if (imageFile) {
      const storageRef = ref(storage, `market_items/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      finalImageUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    const itemData = {
      sellerId: user.id,
      sellerName: user.name,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice
        ? parseFloat(formData.originalPrice)
        : null,
      category: formData.category,
      status: MarketItemStatus.AVAILABLE,
      location: formData.location,
      imageUrl:
        finalImageUrl ||
        `https://picsum.photos/seed/${formData.title}/800/600`,
      createdAt: Date.now(),
    };
        await addDoc(collection(db, 'market_items'), itemData);
    navigate('/marketplace');
  } catch (error) {
    console.error("Error creating market item:", error);
    alert("Failed to create item. Please try again.");
  } finally {
    setLoading(false);
  }
};
await addDoc(collection(db, 'market_items'), itemData);
    navigate('/marketplace');
  } catch (error) {
    console.error("Error creating market item:", error);
    alert("Failed to create item. Please try again.");
  } finally {
    setLoading(false);
  }
};