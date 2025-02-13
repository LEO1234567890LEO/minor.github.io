/*
  # Initial schema setup for food distribution platform

  1. New Tables
    - profiles
      - id (uuid, references auth.users)
      - user_type (donor/recipient)
      - organization_name
      - phone
      - address
    - food_listings
      - id (uuid)
      - donor_id (references profiles)
      - title
      - description
      - quantity
      - unit
      - event_type
      - location
      - expiry_time
      - status
    - food_requests
      - id (uuid)
      - listing_id (references food_listings)
      - recipient_id (references profiles)
      - status
      - requested_quantity
      - created_at

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  user_type text NOT NULL CHECK (user_type IN ('donor', 'recipient')),
  organization_name text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create food_listings table
CREATE TABLE food_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES profiles NOT NULL,
  title text NOT NULL,
  description text,
  quantity integer NOT NULL,
  unit text NOT NULL,
  event_type text,
  location text NOT NULL,
  expiry_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available listings"
  ON food_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Donors can insert their own listings"
  ON food_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update their own listings"
  ON food_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id);

-- Create food_requests table
CREATE TABLE food_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES food_listings NOT NULL,
  recipient_id uuid REFERENCES profiles NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  requested_quantity integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipients can view their own requests"
  ON food_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Donors can view requests for their listings"
  ON food_requests FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM food_listings
    WHERE food_listings.id = food_requests.listing_id
    AND food_listings.donor_id = auth.uid()
  ));

CREATE POLICY "Recipients can create requests"
  ON food_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Donors can update request status"
  ON food_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM food_listings
    WHERE food_listings.id = food_requests.listing_id
    AND food_listings.donor_id = auth.uid()
  ));