import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import type { FoodListing, FoodRequest } from '../types';

interface FoodListingsDB extends DBSchema {
  food_listings: {
    key: string;
    value: FoodListing;
    indexes: {
      'by-donor': string;
      'by-status': string;
      'by-created': string;
    };
  };
  food_requests: {
    key: string;
    value: FoodRequest & { food_listings: FoodListing };
    indexes: {
      'by-recipient': string;
      'by-listing': string;
      'by-created': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<FoodListingsDB>>;

const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<FoodListingsDB>('food_listings_db', 1, {
      upgrade(db) {
        // Food listings store
        if (!db.objectStoreNames.contains('food_listings')) {
          const listingsStore = db.createObjectStore('food_listings', { keyPath: 'id' });
          listingsStore.createIndex('by-donor', 'donorId');
          listingsStore.createIndex('by-status', 'status');
          listingsStore.createIndex('by-created', 'createdAt');
        }

        // Food requests store
        if (!db.objectStoreNames.contains('food_requests')) {
          const requestsStore = db.createObjectStore('food_requests', { keyPath: 'id' });
          requestsStore.createIndex('by-recipient', 'recipientId');
          requestsStore.createIndex('by-listing', 'listingId');
          requestsStore.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
};

// Initialize the database when the module loads
initDB().catch(error => {
  console.error('Failed to initialize database:', error);
});

export const foodListingsDb = {
  createListing: async (listing: Omit<FoodListing, 'id' | 'createdAt'>) => {
    try {
      const db = await initDB();
      const id = uuidv4();
      const timestamp = new Date().toISOString();
      
      const newListing = {
        id,
        ...listing,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await db.add('food_listings', newListing);
      return id;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error('Failed to create listing');
    }
  },

  getListings: async (filters?: { donorId?: string; status?: string }) => {
    try {
      const db = await initDB();
      let listings: FoodListing[] = [];

      if (filters?.donorId) {
        listings = await db.getAllFromIndex('food_listings', 'by-donor', filters.donorId);
      } else if (filters?.status) {
        listings = await db.getAllFromIndex('food_listings', 'by-status', filters.status);
      } else {
        listings = await db.getAll('food_listings');
      }

      return listings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting listings:', error);
      throw new Error('Failed to get listings');
    }
  },

  updateListing: async (id: string, updates: Partial<FoodListing>) => {
    try {
      const db = await initDB();
      const listing = await db.get('food_listings', id);
      if (!listing) throw new Error('Listing not found');

      const updatedListing = {
        ...listing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await db.put('food_listings', updatedListing);
    } catch (error) {
      console.error('Error updating listing:', error);
      throw new Error('Failed to update listing');
    }
  },

  deleteListing: async (id: string) => {
    try {
      const db = await initDB();
      await db.delete('food_listings', id);
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw new Error('Failed to delete listing');
    }
  }
};

export const foodRequestsDb = {
  createRequest: async (request: Omit<FoodRequest, 'id' | 'createdAt'>) => {
    try {
      const db = await initDB();
      const id = uuidv4();
      const timestamp = new Date().toISOString();
      
      const listing = await db.get('food_listings', request.listingId);
      if (!listing) throw new Error('Listing not found');

      const newRequest = {
        id,
        ...request,
        createdAt: timestamp,
        updatedAt: timestamp,
        food_listings: listing,
      };

      await db.add('food_requests', newRequest);
      return id;
    } catch (error) {
      console.error('Error creating request:', error);
      throw new Error('Failed to create request');
    }
  },

  getRequests: async (filters: { recipientId?: string; listingId?: string }) => {
    try {
      const db = await initDB();
      let requests = [];

      if (filters.recipientId) {
        requests = await db.getAllFromIndex('food_requests', 'by-recipient', filters.recipientId);
      } else if (filters.listingId) {
        requests = await db.getAllFromIndex('food_requests', 'by-listing', filters.listingId);
      }

      return requests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting requests:', error);
      throw new Error('Failed to get requests');
    }
  },

  updateRequest: async (id: string, status: string) => {
    try {
      const db = await initDB();
      const request = await db.get('food_requests', id);
      if (!request) throw new Error('Request not found');

      const updatedRequest = {
        ...request,
        status,
        updatedAt: new Date().toISOString(),
      };

      await db.put('food_requests', updatedRequest);
    } catch (error) {
      console.error('Error updating request:', error);
      throw new Error('Failed to update request');
    }
  }
};