const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const stands = require('./data/stands');
const orderManager = require('./services/orderManager');
const { getDistanceFromLatLonInM } = require('./services/geo');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for MVP
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- REST API (Legacy/Helpers) ---

const findStand = (id) => stands.find(s => s.id === id);

app.get('/api/stands/:id', (req, res) => {
  const stand = findStand(req.params.id);
  if (!stand) return res.status(404).json({ error: 'Stand not found' });
  res.json(stand);
});

// --- Socket.io Logic ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. Driver Joins a Stand Channel
  socket.on('driver_join', ({ standId, name }) => {
    console.log(`Driver ${name} joining stand ${standId}`);
    socket.join(`stand_${standId}`);
    
    // Register driver in memory
    orderManager.addDriver(socket.id, {
      id: socket.id,
      standId,
      name,
      status: 'idle'
    });
  });

  // 2. Customer Requests Taxi
  socket.on('request_taxi', ({ standId, userLocation }) => {
    console.log(`Order request for stand ${standId}`, userLocation);

    const stand = findStand(standId);
    if (!stand) {
      socket.emit('order_error', { message: 'Geçersiz Durak ID' });
      return;
    }

    // Verify Location (GPS Check)
    // Max distance: 150 meters
    const distance = getDistanceFromLatLonInM(
      stand.location.lat, stand.location.lng,
      userLocation.lat, userLocation.lng
    );

    console.log(`Distance verification: ${distance.toFixed(2)}m`);

    if (distance > 150) {
      socket.emit('order_error', { message: 'Durak konumunda değilsiniz. Lütfen QR kodun yanına yaklaşın.' });
      return;
    }

    // Create Order
    const orderId = `ORD-${Date.now()}`;
    const order = {
      orderId,
      customerId: socket.id,
      standId,
      standLocation: stand.location,
      userLocation,
      status: 'pending',
      timestamp: new Date()
    };
    
    orderManager.addOrder(order);
    socket.join(`order_${orderId}`);

    // Notify Drivers at this stand
    io.to(`stand_${standId}`).emit('new_request', order);
    
    // Confirm to Customer
    socket.emit('order_created', order);
  });

  // 3. Driver Accepts Order
  socket.on('accept_order', ({ orderId, driverInfo }) => {
    const order = orderManager.getOrder(orderId);
    if (!order || order.status !== 'pending') {
      socket.emit('accept_error', { message: 'Sipariş artık mevcut değil.' });
      return;
    }

    // Update Order
    order.status = 'active';
    order.driver = {
      id: socket.id,
      ...driverInfo
    };
    orderManager.updateOrder(orderId, order);

    // Join Order Room
    socket.join(`order_${orderId}`);

    // Notify Customer (and Driver)
    io.to(`order_${orderId}`).emit('order_accepted', order);
  });

  // 4. Driver Updates Location (Simulation or Real)
  socket.on('driver_location_update', ({ orderId, location, eta }) => {
    // Broadcast to the order room (Customer listens to this)
    io.to(`order_${orderId}`).emit('trip_update', {
      location,
      eta // seconds or text
    });
  });
  
  // 5. Trip Completed
  socket.on('trip_completed', ({ orderId }) => {
      io.to(`order_${orderId}`).emit('trip_finished');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    orderManager.removeDriver(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io Server running on port ${PORT}`);
});
