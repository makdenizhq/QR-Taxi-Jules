# Mobile-Web Taxi-Call via QR Code (MVP)

A full-stack MVP for calling a taxi by scanning a QR code, featuring real-time dispatch and live vehicle tracking.

## Features

- **QR Code Scanning**: Encodes Stand ID and location.
- **GPS Verification**: Ensures the user is physically near the stand (within 150m) to prevent spam.
- **Real-time Dispatch**:
  - Customer requests taxi -> Driver receives notification instantly (Socket.io).
  - Driver accepts -> Customer gets confirmation.
- **Live Tracking & Simulation**:
  - Driver App simulates movement along a real road route (using OSRM).
  - Customer sees the taxi moving on the map in real-time.
  - ETA updates dynamically based on the simulation.
  
## Project Structure

- `client/`: React frontend (Vite + Leaflet + Socket.io-client).
- `server/`: Node.js + Express + Socket.io backend.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository.
2. Install dependencies for both server and client:

   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

### Running the App

1. **Start the Backend Server**:
   ```bash
   cd server
   node index.js
   ```
   The server runs on `http://localhost:3001`.

2. **Start the Frontend Client**:
   ```bash
   cd client
   npm run dev
   ```
   The client runs on `http://localhost:5173`.

### How to Test the Full Flow

Since this app requires two roles (Customer and Driver), follow these steps to simulate a ride:

1. **Open Driver App (Tab 1)**:
   - Go to `http://localhost:5173/driver`.
   - Select "Stand 1" and click "Göreve Başla".
   - The driver is now waiting for requests.

2. **Open Customer App (Tab 2)**:
   - Go to `http://localhost:5173/?standId=stand_1`.
   - **Important**: You must allow Location Access when prompted.
   - Click "Konumumu Doğrula ve Çağır".
   - *Note*: If you are not physically at the coordinates of Stand 1 (Istanbul), the validation might fail. For testing, you can adjust the coordinates in `server/data/stands.js` to your current location or use a "Fake GPS" tool.

3. **Dispatch & Tracking**:
   - Switch back to the **Driver App**. You will see a new request. Click "Kabul Et".
   - The simulation will start. The driver marker will move along the road on the map.
   - Switch to the **Customer App**. You will see "Taksi Geliyor" and the taxi marker moving towards you in real-time.

## Data

The valid taxi stands are defined in `server/data/stands.js`.

## Tech Stack

- **Frontend**: React, Vite, Leaflet, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Routing**: OSRM (Open Source Routing Machine) API
