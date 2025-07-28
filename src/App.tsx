import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Page/Register';
import Dashboard from './Page/Dashboard';
import Login from './Page/Login';
import DashboardSiswa from './Page/Siswa/Dashboard';
import Todo from './Page/Siswa/Todo';
import Attendance from './Page/Siswa/Attendance';
import Report from './Page/Siswa/Report';
import Layout from './Layout/Layout';
import Profile from './Page/Siswa/Profile';
import DashboardSuperAdmin from './Page/SuperAdmin/Dashboard';
import DashboardMentor from './Page/Mentor/Dashboard';
import DashboardGuru from './Page/Guru/Dashboard';
import UserManagement from './Page/SuperAdmin/User Management';
import Institusi from './Page/SuperAdmin/Institusi';
import DataTugas from './Page/SuperAdmin/Data Tugas';


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
        <Route path='/ProfileSiswa' element={<Layout><Profile /></Layout>} />
        <Route path='/DashboardSuperAdmin' element={<DashboardSuperAdmin />} />
        <Route path='/DashboardMentor' element={<DashboardMentor />} />
        <Route path='/DashboardGuru' element={<DashboardGuru />} />
        <Route path='/UserManagement' element={<UserManagement />} />
        <Route path='/Institusi' element={<Institusi />} />
        <Route path='/DataTugas' element={<DataTugas />} />
      </Routes>
    </Router>
  );
}

export default App;
