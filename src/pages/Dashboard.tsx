import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import DonateModal from '../components/DonateModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === 'listings') {
        const { data, error } = await supabase
          .from('food_listings')
          .select('*, food_requests(count)')
          .eq('donor_id', user!.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } else {
        // Join with profiles for organization name and get recipient details
        const { data, error } = await supabase
          .from('food_requests')
          .select(`
            *,
            food_listings!inner(*),
            profiles!inner(organization_name),
            recipient:profiles!recipient_id(organization_name)
          `)
          .eq('food_listings.donor_id', user!.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
    try {
      const { error } = await supabase
        .from('food_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
      toast.success(`Request ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  }

  async function handleDeleteListing(listingId: string) {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setIsDeleting(true);
    try {
      // First check if there are any accepted requests for this listing
      const { data: acceptedRequests, error: checkError } = await supabase
        .from('food_requests')
        .select('id')
        .eq('listing_id', listingId)
        .eq('status', 'accepted');

      if (checkError) throw checkError;

      if (acceptedRequests && acceptedRequests.length > 0) {
        toast.error('Cannot delete listing with accepted requests');
        return;
      }

      // Delete all pending requests for this listing first
      const { error: requestsError } = await supabase
        .from('food_requests')
        .delete()
        .eq('listing_id', listingId)
        .in('status', ['pending', 'rejected']);

      if (requestsError) throw requestsError;

      // Then delete the listing
      const { error: listingError } = await supabase
        .from('food_listings')
        .delete()
        .eq('id', listingId);

      if (listingError) throw listingError;

      toast.success('Listing deleted successfully');
      
      // Update the listings state to remove the deleted listing
      setListings(listings.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your {user?.user_metadata.user_type === 'donor' ? 'food donations' : 'food requests'}
            </p>
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

        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'listings'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Listings
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'requests'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {user?.user_metadata.user_type === 'donor' ? 'Received Requests' : 'My Requests'}
            </button>
          </nav>
        </div>

        {activeTab === 'listings' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      listing.status === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2">
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
                      <span>Expires: {new Date(listing.expiry_time).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 py-2 border-t">
                    <p className="text-sm text-gray-600">
                      {listing.food_requests?.[0]?.count || 0} requests received
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                      Edit
                    </button>
                    <button 
                      className="flex-1 border border-red-600 text-red-600 py-2 px-4 rounded-md hover:bg-red-50 disabled:opacity-50"
                      onClick={() => handleDeleteListing(listing.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {listings.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No listings found</p>
                <button
                  onClick={() => setIsDonateModalOpen(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Listing
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Request for {request.food_listings.title}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600">
                        Quantity requested: {request.requested_quantity} {request.food_listings.unit}
                      </p>
                      <p className="text-gray-600">
                        From: {request.recipient?.organization_name || 'Anonymous User'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Status: <span className="capitalize">{request.status}</span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        Requested on: {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {user?.user_metadata.user_type === 'donor' && request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequestStatus(request.id, 'accepted')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Accept Request"
                      >
                        <CheckCircle className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleRequestStatus(request.id, 'rejected')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Reject Request"
                      >
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {requests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No requests found</p>
              </div>
            )}
          </div>
        )}

        {isDonateModalOpen && (
          <DonateModal
            isOpen={isDonateModalOpen}
            onClose={() => setIsDonateModalOpen(false)}
            onSuccess={() => {
              setIsDonateModalOpen(false);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
}