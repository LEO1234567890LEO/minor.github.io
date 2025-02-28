import React from 'react';
import { Heart, UtensilsCrossed, Users } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-green-600">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Reducing Food Waste,
              <span className="block">Feeding Communities</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-green-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect excess food from events with organizations that need it. Join our mission to reduce food waste and help those in need.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <a href="/register" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                Start Donating
              </a>
              <a href="/listings" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 md:py-4 md:text-lg md:px-10">
                Find Food
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Making food redistribution simple
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">List Excess Food</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Event organizers can easily list leftover food with details about quantity and type.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Connect with Recipients</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Organizations in need can browse available food and request what they need.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Heart className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Make a Difference</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Help reduce food waste while supporting those in need in your community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}