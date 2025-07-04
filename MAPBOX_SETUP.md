# Mapbox Setup Guide

## Getting Started with Mapbox

1. **Create a Mapbox Account**
   - Go to [mapbox.com](https://account.mapbox.com/) and create a free account
   - Free tier includes 50,000 free map loads per month

2. **Get Your Access Token**
   - Navigate to [Access Tokens](https://account.mapbox.com/access-tokens/)
   - Copy your default public token (starts with `pk.`)

3. **Add Token to Your Project**
   - Create a `.env.local` file in the project root
   - Add your token:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
   ```

4. **Restart Development Server**
   ```bash
   npm run dev
   ```

## Features Included

- **Interactive Map**: Pan, zoom, and navigate
- **Trail Markers**: Hiking trails with custom icons (🥾)
- **Shop Markers**: Outdoor gear shops (🏪)  
- **Popups**: Click markers for trail/shop details
- **Outdoor Style**: Uses Mapbox's outdoors style map

## Map Customization

You can customize the map by modifying the `MapboxMap` component:

- **Map Style**: Change the `style` prop (streets, outdoors, satellite, etc.)
- **Initial Location**: Update `initialViewState` coordinates
- **Markers**: Add/modify markers in the component
- **Controls**: Navigation controls are included by default

## Development Mode

Without a valid token, the map shows a helpful setup message with instructions.
