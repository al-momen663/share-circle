import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarketItem, MarketItemStatus, User } from '../types';

interface MarketplaceProps {
  user: User | null;
}