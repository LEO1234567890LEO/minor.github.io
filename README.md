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



### Login Page



### Signup Page



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

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

[Specify the license, e.g., MIT License]

## Contact

For any questions or issues, feel free to reach out at [your contact email or GitHub profile].

