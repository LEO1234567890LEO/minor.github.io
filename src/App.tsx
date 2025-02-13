import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FoodListings from './pages/FoodListings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = React.useState(window.location.pathname);
  const { user } = useAuth();

  React.useEffect(() => {
    const handleNavigation = () => {
      setCurrentPage(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const renderPage = () => {
    // If user is logged in and on home page, show FoodListings instead
    if (user && currentPage === '/') {
      return <FoodListings />;
    }

    switch (currentPage) {
      case '/dashboard':
        return <Dashboard />;
      case '/listings':
        return <FoodListings />;
      case '/profile':
        return <Profile />;
      case '/login':
        return <Login />;
      case '/register':
        return <Register />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {renderPage()}
      <Toaster position="top-right" />
    </div>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;