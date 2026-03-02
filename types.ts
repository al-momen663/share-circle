
export enum UserRole {
  DONOR = 'DONOR',
  VOLUNTEER = 'VOLUNTEER',
  MEMBER = 'MEMBER'
}

export enum DonationType {
  FOOD = 'FOOD',
  CLOTHES = 'CLOTHES'
}

export enum MarketCategory {
  FOOD = 'FOOD',
  GROCERY = 'GROCERY',
  FURNITURE = 'FURNITURE'
}

export enum MarketItemStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED'
}

export enum DonationStatus {
  AVAILABLE = 'AVAILABLE',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  volunteerId?: string;
  title: string;
  description: string;
  type: DonationType;
  status: DonationStatus;
  location: string;
  imageUrl: string;
  createdAt: number;
}

export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: MarketCategory;
  status: MarketItemStatus;
  location: string;
  imageUrl: string;
  createdAt: number;
}

export interface Message {
  id: string;
  donationId?: string;
  marketItemId?: string;
  senderId: string;
  text: string;
  timestamp: number;
}
