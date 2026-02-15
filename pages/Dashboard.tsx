import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserRole, Donation, DonationStatus, DonationType } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});