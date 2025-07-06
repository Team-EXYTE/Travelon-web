import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon issues
import L from "leaflet";

// Marker setup - client-side only
const MarkerSetup = () => {
  useEffect(() => {
    // Fix icon issues with next/image optimization
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  return null;
};

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Marker drag handler component
function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onPositionChange(position.lat, position.lng);
        },
      }}
    />
  );
}

// Map click handler component
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([
    latitude || 6.9271,
    longitude || 79.8612,
  ]);
  const [userLocated, setUserLocated] = useState(false);

  // Try to get user's current location on component mount
  useEffect(() => {
    if (!latitude && !longitude && !userLocated) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          onLocationChange(latitude, longitude);
          setUserLocated(true);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setPosition([6.9271, 79.8612]);
          onLocationChange(6.9271, 79.8612);
        }
      );
    } else if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude, onLocationChange, userLocated]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  const handleMarkerPositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      {/* Fix marker icons */}
      <MarkerSetup />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker
        position={position}
        onPositionChange={handleMarkerPositionChange}
      />
      <MapClickHandler onMapClick={handleMapClick} />
    </MapContainer>
  );
};

export default LocationMap;
