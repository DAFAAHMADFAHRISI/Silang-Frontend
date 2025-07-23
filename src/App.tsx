import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Page/Register';
import Dashboard from './Page/Dashboard';
import Login from './Page/Login';
import DashboardSiswa from './Page/Siswa/Dashboard';
import Todo from './Page/Siswa/Todo';
import Attendance from './Page/Siswa/Attendance';
import Report from './Page/Siswa/Report';
import Layout from './LayoutSiswa/Layout';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/DashboardSiswa' element={<Layout><DashboardSiswa /></Layout>} />
        <Route path='/TodoSiswa' element={<Layout><Todo /></Layout>} />
        <Route path='/AttendanceSiswa' element={<Layout><Attendance /></Layout>} />
        <Route path='/ReportSiswa' element={<Layout><Report /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
