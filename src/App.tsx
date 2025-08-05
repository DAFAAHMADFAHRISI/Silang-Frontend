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
import DataJadwal from './Page/SuperAdmin/Data Jadwal';
import DataAbsensi from './Page/SuperAdmin/Data Absensi';
import DataMentorSiswa from './Page/SuperAdmin/Data Mentor-Siswa';
import DataGuruSiswa from './Page/SuperAdmin/Data Guru - Siswa';
import DataRekap from './Page/SuperAdmin/Data Rekap';
import DataTugasGuru from './Page/Guru/Tugas/Data Tugas';
import DataAbsensiGuru from './Page/Guru/Absensi/Data Absensi';
import DataRekapGuru from './Page/Guru/Rekap/Data Rekap';
import TugasMentor from './Page/Mentor/Tugas/TugasMentor';
import TambahTugas from './Page/Mentor/Tugas/Tambah/Tambah';
import EditTugas from './Page/Mentor/Tugas/Edit/Edit';
import DataAbsensiMentor from './Page/Mentor/Data Absensi';
import DataRekapMentor from './Page/Mentor/Data Rekap';
import DetailTugas from './Page/Guru/Tugas/Detail/Detail';
import DetailAbsensi from './Page/Guru/Absensi/Detail/Detail';
import DetailRekap from './Page/Guru/Rekap/Detail/Detail';


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
        
        {/* Mentor Routes with /mentor prefix */}
        <Route path='/mentor/dashboard' element={<DashboardMentor />} />
        <Route path='/mentor/tugas' element={<TugasMentor />} />
        <Route path='/mentor/tugas/tambah' element={<TambahTugas />} />
        <Route path='/mentor/tugas/edit/:id' element={<EditTugas />} />
        <Route path='/mentor/absensi' element={<DataAbsensiMentor />} />
        <Route path='/mentor/rekap' element={<DataRekapMentor />} />
        
        {/* Guru Routes with /guru prefix */}
        <Route path='/guru/dashboard' element={<DashboardGuru />} />
        <Route path='/guru/tugas' element={<DataTugasGuru />} />
        <Route path='/guru/absensi' element={<DataAbsensiGuru />} />
        <Route path='/guru/rekap' element={<DataRekapGuru />} />
        
        {/* Guru Detail Routes */}
        <Route path='/guru/tugas/detail/:id' element={<DetailTugas />} />
        <Route path='/guru/absensi/detail/:id' element={<DetailAbsensi />} />
        <Route path='/guru/rekap/detail/:id' element={<DetailRekap />} />
        
        <Route path='/UserManagement' element={<UserManagement />} />
        <Route path='/Institusi' element={<Institusi />} />
        <Route path='/DataTugas' element={<DataTugas />} />
        <Route path='/DataJadwal' element={<DataJadwal />} />
        <Route path='/DataAbsensi' element={<DataAbsensi />} />
        <Route path='/DataMentorSiswa' element={<DataMentorSiswa />} />
        <Route path='/DataGuruSiswa' element={<DataGuruSiswa />} />
        <Route path='/DataRekap' element={<DataRekap />} />
        <Route path='/DataAbsensiMentor' element={<DataAbsensiMentor />} />
        <Route path='/DataRekapMentor' element={<DataRekapMentor />} />
      </Routes>
    </Router>
  );
}

export default App;
