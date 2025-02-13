import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Package, Search, Filter, ChevronDown, Plus, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import DonateModal from '../components/DonateModal';

export default function FoodListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
    if (user) {
      fetchUserLocation();
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, sortBy, locationFilter]);

  async function fetchUserLocation() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.address) {
        setUserLocation(data.address);
        setLocationFilter(data.address);
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  }

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('location')
        .eq('status', 'available')
        .order('location');

      if (error) throw error;

      // Get unique locations
      const uniqueLocations = [...new Set(data.map(item => item.location))];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }

  async function fetchListings() {
    try {
      let query = supabase
        .from('food_listings')
        .select('*, food_requests(count)');

      if (selectedCategory !== 'all') {
        query = query.eq('event_type', selectedCategory);
      }

      if (locationFilter) {
        query = query.eq('location', locationFilter);
      }

      query = query.eq('status', 'available');

      let { data: fetchedListings, error } = await query;

      if (error) throw error;

      // Apply sorting
      fetchedListings = (fetchedListings || []).sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'expiring-soon':
            return new Date(a.expiry_time).getTime() - new Date(b.expiry_time).getTime();
          case 'quantity-high':
            return b.quantity - a.quantity;
          default:
            return 0;
        }
      });

      setListings(fetchedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest(listingId: string, quantity: number) {
    if (!user) {
      toast.error('Please sign in to request food');
      return;
    }

    if (user.user_metadata.user_type === 'donor') {
      toast.error('Donors cannot request food');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('food_requests')
        .insert({
          listing_id: listingId,
          recipient_id: user.id,
          requested_quantity: quantity,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Request submitted successfully');
      fetchListings();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-gray-600">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Food</h1>
            <p className="mt-2 text-gray-600">Browse and request available food donations</p>
          </div>
          {user?.user_metadata.user_type === 'donor' && (
            <button
              onClick={() => setIsDonateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Donate Food
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search food listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
              {userLocation && (
                <button
                  onClick={() => setLocationFilter(userLocation)}
                  className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  My Location
                </button>
              )}

              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="party">Party</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="expiring-soon">Expiring Soon</option>
                  <option value="quantity-high">Highest Quantity</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                  <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    {listing.event_type}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{listing.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Package className="h-5 w-5 mr-2" />
                    <span>{listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Available until {new Date(listing.expiry_time).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-4">
                    {listing.food_requests?.[0]?.count || 0} requests received
                  </p>

                  <button
                    onClick={() => handleRequest(listing.id, Math.min(listing.quantity, 10))}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!user || user.user_metadata.user_type === 'donor' || isSubmitting}
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Request Food'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {isDonateModalOpen && (
        <DonateModal
          isOpen={isDonateModalOpen}
          onClose={() => setIsDonateModalOpen(false)}
          onSuccess={() => {
            setIsDonateModalOpen(false);
            fetchListings();
          }}
        />
      )}
    </div>
  );
}