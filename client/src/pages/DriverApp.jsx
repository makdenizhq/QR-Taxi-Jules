import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { getRoute } from '../services/routing';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Taxi Icon
const taxiIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/198/198335.png', // Simple taxi icon
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function DriverApp() {
  const [activeTab, setActiveTab] = useState('login'); // login, dashboard, active
  const [standId, setStandId] = useState('stand_1');
  const [driverName, setDriverName] = useState('Ahmet Yılmaz');
  const [requests, setRequests] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(true); // Toggle state
  const [currentLocation, setCurrentLocation] = useState(null); // [lat, lng]
  const [routePath, setRoutePath] = useState([]);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    // Listen for new requests
    socket.on('new_request', (order) => {
      console.log('New request received:', order);
      setRequests(prev => [...prev, order]);
    });

    return () => {
      socket.off('new_request');
    };
  }, []);

  const handleLogin = () => {
    socket.emit('driver_join', { standId, name: driverName });
    setActiveTab('dashboard');
    
    // Simulate Driver Start Position (Random nearby point)
    // For MVP, just hardcode a starting point near Stand 1
    setCurrentLocation([41.0090, 28.9790]); 
  };

  const handleAccept = async (order) => {
    socket.emit('accept_order', {
      orderId: order.orderId,
      driverInfo: {
        plate: '34 TKS 99',
        model: 'Fiat Egea',
        color: 'Sarı'
      }
    });

    setActiveOrder(order);
    setActiveTab('active');
    setRequests(prev => prev.filter(r => r.orderId !== order.orderId));

    if (isSimulationMode) {
      startSimulation(order);
    } else {
      startRealTracking(order.orderId);
    }
  };

  const startRealTracking = (orderId) => {
    if (!navigator.geolocation) {
      alert("GPS desteklenmiyor!");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = [latitude, longitude];
        setCurrentLocation(newLoc);

        // Send update to server
        socket.emit('driver_location_update', {
          orderId,
          location: { lat: latitude, lng: longitude },
          eta: null // Real ETA requires constant recalculation, skipping for MVP or letting client estimate
        });
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Cleanup on unmount or trip end
  useEffect(() => {
    return () => stopTracking();
  }, []);

  const finishTrip = (orderId) => {
    stopTracking();
    setSimulationActive(false);
    socket.emit('trip_completed', { orderId });
    setActiveOrder(null);
    setActiveTab('dashboard');
  };

  const startSimulation = async (order) => {
    if (!currentLocation) return;
    setSimulationActive(true);

    const startLat = currentLocation[0];
    const startLng = currentLocation[1];
    const endLat = order.userLocation.lat;
    const endLng = order.userLocation.lng;

    // 1. Get Route from Driver(current) to User(stand)
    let route = await getRoute(startLat, startLng, endLat, endLng);

    // Fallback if OSRM fails (or returns null)
    if (!route) {
        console.log("Routing failed (OSRM), using fallback straight line simulation.");
        const steps = 60; // 60 seconds trip
        const path = [];
        for (let i = 0; i <= steps; i++) {
            path.push([
                startLat + (endLat - startLat) * (i / steps),
                startLng + (endLng - startLng) * (i / steps)
            ]);
        }
        route = { coordinates: path };
    }

    if (route) {
      setRoutePath(route.coordinates);
      simulateMovement(route.coordinates, order.orderId);
    }
  };

  const simulateMovement = (path, orderId) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= path.length) {
        clearInterval(interval);
        finishTrip(orderId); // Use common finish function
        return;
      }

      const point = path[index];
      setCurrentLocation(point);
      
      // Calculate remaining ETA (simple approximation)
      const remainingSteps = path.length - index;
      const etaSeconds = remainingSteps; // Assuming 1 step = 1 sec for demo

      socket.emit('driver_location_update', {
        orderId,
        location: { lat: point[0], lng: point[1] },
        eta: Math.ceil(etaSeconds / 60) // minutes
      });

      index++;
    }, 1000); // Update every 1 second
  };

  // --- RENDER ---

  if (activeTab === 'login') {
    return (
      <div className="container">
        <div className="card">
          <h2>🚖 Şoför Girişi</h2>
          <label>Ad Soyad:</label>
          <input 
            value={driverName}
            onChange={e => setDriverName(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <label>Durak ID:</label>
          <select 
             value={standId} 
             onChange={e => setStandId(e.target.value)}
             style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
          >
            <option value="stand_1">Sultan Ahmet (Stand 1)</option>
            <option value="stand_2">Beşiktaş (Stand 2)</option>
            <option value="stand_3">Kadıköy (Stand 3)</option>
          </select>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isSimulationMode} 
                onChange={(e) => setIsSimulationMode(e.target.checked)} 
                style={{ width: '20px', height: '20px' }}
              />
              <span>Simülasyon Modu (Test İçin)</span>
            </label>
            <small style={{ color: '#666' }}>
              {isSimulationMode 
                ? "Rota otomatik çizilir ve araç kendi kendine gider." 
                : "Telefonunuzun GPS konumu kullanılır (Hareket etmelisiniz)."}
            </small>
          </div>

          <button className="btn-primary" onClick={handleLogin}>Göreve Başla</button>
        </div>
      </div>
    );
  }

  if (activeTab === 'dashboard') {
    return (
      <div className="container">
        <h2>Bekleyen Talepler</h2>
        <div style={{background: '#e3f2fd', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>
            <strong>Mod:</strong> {isSimulationMode ? "Simülasyon 🎮" : "Gerçek GPS 📡"}
        </div>
        {requests.length === 0 ? <p>Henüz talep yok...</p> : requests.map(req => (
          <div key={req.orderId} className="card" style={{ textAlign: 'left' }}>
            <h3>Durak: {req.standId}</h3>
            <p>Müşteri ID: {req.customerId.substr(0, 5)}</p>
            <button className="btn-primary" onClick={() => handleAccept(req)}>Kabul Et</button>
          </div>
        ))}
      </div>
    );
  }

  return ( // Active Tab
    <div className="container">
       <div className="card">
         <h2>Yolculuk Aktif</h2>
         <p>Hedef: {activeOrder.standId}</p>
         {isSimulationMode && <p style={{color: 'green'}}>Simülasyon Devrede...</p>}
         {!isSimulationMode && <p style={{color: 'blue'}}>Canlı GPS Takibi Aktif...</p>}
         <button className="btn-secondary" onClick={() => finishTrip(activeOrder.orderId)}>Yolculuğu Bitir</button>
       </div>
       
       <div className="map-container" style={{ height: '400px' }}>
          {currentLocation && (
            <MapContainer 
              center={currentLocation} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={currentLocation} icon={taxiIcon}></Marker>
              <Marker position={[activeOrder.userLocation.lat, activeOrder.userLocation.lng]}></Marker>
              {routePath.length > 0 && <Polyline positions={routePath} color="blue" />}
            </MapContainer>
          )}
       </div>
    </div>
  );
}
