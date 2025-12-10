import React, { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import { API_URL } from '../config';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Taxi Icon
const taxiIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/198/198335.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function CustomerApp() {
  const [stand, setStand] = useState(null);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, locating, requesting, active, finished
  const [taxiLocation, setTaxiLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Get Stand ID
    const params = new URLSearchParams(window.location.search);
    const standId = params.get('standId');

    if (standId) {
      axios.get(`${API_URL}/api/stands/${standId}`)
        .then(res => setStand(res.data))
        .catch(err => setError('Durak bulunamadı'));
    } else {
        setError('QR Kod Okutulmadı (Stand ID yok)');
    }

    // 2. Socket Listeners
    socket.on('order_created', (order) => {
        setOrder(order);
        setStatus('requesting'); // Waiting for driver
    });

    socket.on('order_error', (data) => {
        alert(data.message);
        setStatus('idle');
    });

    socket.on('order_accepted', (updatedOrder) => {
        setOrder(updatedOrder);
        setStatus('active');
    });

    socket.on('trip_update', (data) => {
        setTaxiLocation(data.location);
        setEta(data.eta);
    });
    
    socket.on('trip_finished', () => {
        setStatus('finished');
        alert('Taksi Geldi! İyi yolculuklar.');
    });

    return () => {
        socket.off('order_created');
        socket.off('order_error');
        socket.off('order_accepted');
        socket.off('trip_update');
        socket.off('trip_finished');
    };
  }, []);

  const handleCallTaxi = () => {
    if (!stand) return;
    setStatus('locating');

    // 1. Get User GPS
    if (!navigator.geolocation) {
        alert('Tarayıcınız konum servisini desteklemiyor.');
        setStatus('idle');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // 2. Send Request via Socket
            socket.emit('request_taxi', {
                standId: stand.id,
                userLocation
            });
        },
        (err) => {
            console.error(err);
            alert('Konum izni verilmedi. Taksi çağırmak için konumunuzu paylaşmalısınız.');
            setStatus('idle');
        },
        { enableHighAccuracy: true }
    );
  };

  if (error) return <div className="container"><h2>Hata</h2><p>{error}</p></div>;
  if (!stand) return <div className="loading">Durak bilgisi yükleniyor...</div>;

  return (
    <div className="container">
      {status === 'idle' && (
        <div className="card">
            <h2>🚖 Taksi Çağır</h2>
            <h3>{stand.name}</h3>
            <p>{stand.location.address}</p>
            <div className="map-container">
                <MapContainer center={[stand.location.lat, stand.location.lng]} zoom={15} style={{height: '100%', width: '100%'}}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[stand.location.lat, stand.location.lng]}></Marker>
                </MapContainer>
            </div>
            <button className="btn-primary" onClick={handleCallTaxi}>Konumumu Doğrula ve Çağır</button>
        </div>
      )}

      {status === 'locating' && (
         <div className="loading">Konumunuz doğrulanıyor...</div>
      )}

      {status === 'requesting' && (
        <div className="card">
            <div className="status-box" style={{borderColor: 'orange', backgroundColor: '#fff3e0'}}>
                <h2>📡 Aranıyor...</h2>
                <p>En yakın sürücüye haber veriliyor.</p>
                <div className="loading"></div>
            </div>
        </div>
      )}

      {status === 'active' && (
         <div className="card">
            <div className="status-box">
                <h2>✅ Taksi Geliyor</h2>
                {eta && <h1>{eta} dk</h1>}
                <p>{order.driver.plate} - {order.driver.model}</p>
            </div>
            
            <div className="map-container" style={{height: '300px'}}>
                <MapContainer center={[stand.location.lat, stand.location.lng]} zoom={14} style={{height: '100%', width: '100%'}}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {/* Stand Marker */}
                    <Marker position={[stand.location.lat, stand.location.lng]}>
                       <Popup>Siz Buradasınız</Popup>
                    </Marker>
                    
                    {/* Taxi Marker (Moving) */}
                    {taxiLocation && (
                        <Marker position={[taxiLocation.lat, taxiLocation.lng]} icon={taxiIcon}>
                            <Popup>Taksi</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
         </div>
      )}
      
      {status === 'finished' && (
          <div className="card">
              <h2>🎉 Taksi Geldi!</h2>
              <button className="btn-primary" onClick={() => window.location.reload()}>Yeni Çağrı</button>
          </div>
      )}
    </div>
  );
}
