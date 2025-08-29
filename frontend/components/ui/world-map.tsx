'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface CountryData {
  country: string;
  users: number;
  coordinates: [number, number]; // [latitude, longitude] for Leaflet
}

interface WorldMapProps {
  data: CountryData[];
}

// Fix for default markers in Leaflet
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background-color: #20d4a9;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

export default function WorldMap({ data }: WorldMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {data.map(({ country, users, coordinates }) => (
          <Marker 
            key={country} 
            position={coordinates}
            icon={createCustomIcon()}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{country}</div>
                <div className="text-sm text-gray-600">{users} users</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
