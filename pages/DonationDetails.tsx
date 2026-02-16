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
};
export default DonationDetails;