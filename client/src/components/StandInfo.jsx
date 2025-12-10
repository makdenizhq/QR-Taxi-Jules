import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const StandInfo = ({ stand, onCallTaxi }) => {
  const { name, location } = stand;

  return (
    <div className="container">
      <div className="card">
        <h2>🚖 Taksi Çağır</h2>
        <p>Bulunduğunuz Durak:</p>
        <h3>{name}</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>{location.address}</p>

        <div className="map-container">
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={15} 
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                {name}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <button className="btn-primary" onClick={onCallTaxi}>
          Taksi Çağır
        </button>
      </div>
    </div>
  );
};

export default StandInfo;
