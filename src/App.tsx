import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Page/Register';
import Dashboard from './Page/Dashboard';
import Login from './Page/Login';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path='/Login'element={<Login/>} />
      </Routes>
    </Router>
  );
}

export default App;
