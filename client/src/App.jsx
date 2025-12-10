import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerApp from './pages/CustomerApp';
import DriverApp from './pages/DriverApp';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerApp />} />
        <Route path="/driver" element={<DriverApp />} />
      </Routes>
    </Router>
  );
}

export default App;
