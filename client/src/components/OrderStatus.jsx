import React, { useEffect, useState } from 'react';

const OrderStatus = ({ order, onCancel }) => {
  const [eta, setEta] = useState(order.eta);

  // Simulate countdown
  useEffect(() => {
    if (eta <= 0) return;
    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000); // Reduce by 1 minute every 60 seconds

    return () => clearInterval(timer);
  }, [eta]);

  return (
    <div className="container">
      <div className="card">
        <div className="status-box">
          <h2>✅ Taksi Yolda</h2>
          <p>Taksiniz yola çıktı, size doğru geliyor.</p>
        </div>

        <h3>Tahmini Varış:</h3>
        <h1 style={{ fontSize: '3rem', margin: '10px 0', color: '#333' }}>
          {eta} dk
        </h1>

        <div className="vehicle-info">
          <p><strong>Plaka:</strong> {order.vehicle.plate}</p>
          <p><strong>Model:</strong> {order.vehicle.model} ({order.vehicle.color})</p>
        </div>

        <button className="btn-secondary" onClick={onCancel}>
          İptal Et / Yeni Çağrı
        </button>
      </div>
    </div>
  );
};

export default OrderStatus;
