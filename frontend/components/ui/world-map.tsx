'use client';

import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from 'react-simple-maps';

interface CountryData {
  country: string;
  users: number;
  coordinates: [number, number]; // [longitude, latitude]
}

interface WorldMapProps {
  data: CountryData[];
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({ data }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="relative">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 120
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#f8fafc"
                  stroke="#e2e8f0"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#f1f5f9", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          
          {data.map(({ country, users, coordinates }) => (
            <Marker key={country} coordinates={coordinates}>
              <circle
                r={4}
                fill="#20d4a9"
                stroke="#ffffff"
                strokeWidth={2}
                onMouseEnter={(e) => {
                  setTooltipContent(`${country}: ${users} users`);
                  setTooltipPosition({
                    x: e.clientX + 10,
                    y: e.clientY - 10
                  });
                }}
                onMouseLeave={() => {
                  setTooltipContent("");
                }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      
      {tooltipContent && (
        <div
          className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}
