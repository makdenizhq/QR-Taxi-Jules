// In-memory state management for the MVP
// In a real app, this would be Redis + Database

class OrderManager {
  constructor() {
    this.orders = {}; // { orderId: { ...orderData } }
    this.drivers = {}; // { socketId: { standId, ...driverData } }
  }

  addOrder(order) {
    this.orders[order.orderId] = order;
    return order;
  }

  getOrder(orderId) {
    return this.orders[orderId];
  }

  updateOrder(orderId, updates) {
    if (this.orders[orderId]) {
      this.orders[orderId] = { ...this.orders[orderId], ...updates };
      return this.orders[orderId];
    }
    return null;
  }

  addDriver(socketId, driverData) {
    this.drivers[socketId] = driverData;
  }

  removeDriver(socketId) {
    delete this.drivers[socketId];
  }

  getDriversAtStand(standId) {
    return Object.values(this.drivers).filter(d => d.standId === standId);
  }
}

module.exports = new OrderManager();
