# Project Name

## Overview

In today’s world, a significant amount of food is wasted during large events like marriage functions while many people struggle to access basic meals. To address this issue, we propose a web-based platform that connects surplus food from marriage functions with individuals and organizations in need.

This system allows event organizers to register leftover food details, including type, quantity, and location on the platform. Simultaneously, needy individuals or NGOs can search for available food donations nearby and request them. The platform includes features like real-time notifications, location-based search, and secure communication between donors and recipients.

By leveraging technology, this project aims to reduce food waste, promote sustainability, and ensure that surplus food reaches those who need it most.

## Features

- **Food Registration:** Event organizers can log food details, including type, quantity, and location.
- **Location-Based Search:** Needy individuals and NGOs can find nearby food donations.
- **Real-Time Notifications:** Instant updates on food availability and requests.
- **Secure Communication:** Donors and recipients can connect securely to coordinate pickup.

## Tech Stack

- **Frontend:** TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Build Tools:** PostCSS, ESLint

## Screenshots

### Home Page

<img src="https://raw.githubusercontent.com/LEO1234567890LEO/project/refs/heads/main/Screenshot%202025-02-09%20153430.png">


### Login Page

<img src="https://raw.githubusercontent.com/LEO1234567890LEO/project/refs/heads/main/Screenshot%202025-02-13%20202606.png">

### Signup Page

<img src="https://raw.githubusercontent.com/LEO1234567890LEO/project/refs/heads/main/Screenshot%202025-02-13%20202500.png">

## Code Explanation

### 1. Frontend Setup

The frontend is built using TypeScript and Vite for fast development and optimized performance.

```tsx
import React from 'react';
import { useState, useEffect } from 'react';

const FoodListing = () => {
  const [foodList, setFoodList] = useState([]);
  
  useEffect(() => {
    fetch('/api/food')
      .then(res => res.json())
      .then(data => setFoodList(data));
  }, []);

  return (
    <div>
      <h1>Available Food Donations</h1>
      <ul>
        {foodList.map(food => (
          <li key={food.id}>{food.name} - {food.quantity}</li>
        ))}
      </ul>
    </div>
  );
};

export default FoodListing;
```



### 2. Backend API

The backend uses Supabase to handle authentication, storage, and database operations.

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key');

export const fetchFoodDonations = async () => {
  const { data, error } = await supabase.from('food_donations').select('*');
  if (error) throw error;
  return data;
};
```



### 3. Real-Time Notifications

This feature ensures that donors and recipients get instant updates.

```ts
supabase
  .channel('food_updates')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'food_donations' }, payload => {
    console.log('New food donation:', payload);
  })
  .subscribe();
```



## Deployment

For production deployment:

```sh
npm run build
npm run preview
```

## Folder Structure

```
project/
│-- .bolt/             # Internal project files
│-- src/               # Source code
│-- supabase/          # Database migrations
│-- index.html         # Main HTML file
│-- package.json       # Project metadata
│-- tailwind.config.js # Tailwind configuration
│-- vite.config.ts     # Vite configuration
│-- .env               # Environment variables
│-- images/            # Screenshots for documentation
```
