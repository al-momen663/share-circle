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