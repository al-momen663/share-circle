import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserRole, Donation, DonationStatus } from '../types';

interface DonationDetailsProps {
  user: User;
}
const DonationDetails: React.FC<DonationDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [donation, setDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'donations', id), (docSnap) => {
      if (docSnap.exists()) {
        setDonation({ id: docSnap.id, ...docSnap.data() } as Donation);
      }
    });
    return () => unsubscribe();
  }, [id]);
};
export