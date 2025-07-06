import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Marker setup - client-side only
const MarkerSetup = () => {
  useEffect(() => {
    // Fix icon issues with next/image optimization
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  
  return null;
};

interface StaticLocationMapProps {
  latitude: number;
  longitude: number;
  popupText?: string;
}

const StaticLocationMap: React.FC<StaticLocationMapProps> = ({
  latitude,
  longitude,
  popupText
}) => {
  // Default to Colombo if coordinates not provided
  const position: [number, number] = [
    latitude || 6.9271, 
    longitude || 79.8612
  ];
  
  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      dragging={true}
      scrollWheelZoom={false}
    >
      <MarkerSetup />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        {popupText && (
          <Popup>
            {popupText}
          </Popup>
        )}
      </Marker>
    </MapContainer>
  );
};

export default StaticLocationMap;