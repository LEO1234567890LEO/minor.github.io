import React from 'react';
import { Menu, X, UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UtensilsCrossed className="h-8 w-8 text-white" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="/listings" className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Food Listings</a>
                {user && user.user_metadata.user_type === 'donor' && (
                  <a href="/dashboard" className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <a href="/profile" className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Profile</a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <a href="/login" className="text-green-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</a>
                  <a href="/register" className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">Register</a>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-green-100 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/" className="text-white block px-3 py-2 rounded-md text-base font-medium">Home</a>
            <a href="/listings" className="text-green-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Food Listings</a>
            {user && user.user_metadata.user_type === 'donor' && (
              <a href="/dashboard" className="text-green-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
            )}
            {user ? (
              <>
                <a href="/profile" className="text-green-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Profile</a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-green-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-green-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Login</a>
                <a href="/register" className="text-green-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Register</a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}