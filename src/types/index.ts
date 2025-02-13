export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'donor' | 'recipient';
}

export interface FoodListing {
  id: string;
  donorId: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  eventType: string;
  location: string;
  expiryTime: string;
  status: 'available' | 'reserved' | 'completed';
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'completed';
  requestedQuantity: number;
  createdAt: string;
}