import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Page/Register';
import Dashboard from './Page/Dashboard';
import Login from './Page/Login';
import DashboardSiswa from './Page/Siswa/Dashboard';
import Todo from './Page/Siswa/Todo/Todo';
import Detail from './Page/Siswa/Todo/Detail/Detail';
import Edit from './Page/Siswa/Todo/Edit/Edit';
import Attendance from './Page/Siswa/Absensi/Attendance';
import Chat from './Page/Siswa/Chat/Chat';
import Report from './Page/Siswa/Report';
import Layout from './Layout/Layout';
import Profile from './Page/Siswa/Profile';
import DashboardSuperAdmin from './Page/SuperAdmin/Dashboard';
import DashboardMentor from './Page/Mentor/Dashboard';
import DashboardGuru from './Page/Guru/Dashboard';
import UserManagement from './Page/SuperAdmin/User Management/User Management';
import TambahUser from './Page/SuperAdmin/User Management/Tambah/Tambah';
import EditUser from './Page/SuperAdmin/User Management/Edit/Edit';
import Institusi from './Page/SuperAdmin/Institusi/Institusi';
import TambahInstitusi from './Page/SuperAdmin/Institusi/Tambah/Tambah';
import EditInstitusi from './Page/SuperAdmin/Institusi/Edit/Edit';
import DataTugas from './Page/SuperAdmin/Tugas/Data Tugas';
import DataJadwal from './Page/SuperAdmin/Jadwal/Data Jadwal';
import TambahJadwal from './Page/SuperAdmin/Jadwal/Tambah/Tambah';
import EditJadwal from './Page/SuperAdmin/Jadwal/Edit/Edit';
import DataAbsensi from './Page/SuperAdmin/Absensi/Data Absensi';
import DataMentorSiswa from './Page/SuperAdmin/Data Mentor Siswa/Data Mentor-Siswa';
import TambahMentorSiswa from './Page/SuperAdmin/Data Mentor Siswa/Tambah/Tambah';
import EditMentorSiswa from './Page/SuperAdmin/Data Mentor Siswa/Edit/Edit';
import DataGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Data Guru - Siswa';
import TambahGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Tambah/Tambah';
import EditGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Edit/Edit';
import DetailGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Detail/Detail';
import DataRekap from './Page/SuperAdmin/Data Rekap/Data Rekap';
import DataTugasGuru from './Page/Guru/Tugas/Data Tugas';
import DataAbsensiGuru from './Page/Guru/Absensi/Data Absensi';
import DataRekapGuru from './Page/Guru/Rekap/Data Rekap';
import TugasMentor from './Page/Mentor/Tugas/TugasMentor';
import TambahTugas from './Page/Mentor/Tugas/Tambah/Tambah';
import EditTugas from './Page/Mentor/Tugas/Edit/Edit';
import DataAbsensiMentor from './Page/Mentor/Absensi/Data Absensi';
import DataRekapMentor from './Page/Mentor/Data Rekap';
import DetailTugas from './Page/Guru/Tugas/Detail/Detail';
import DetailAbsensi from './Page/Guru/Absensi/Detail/Detail';
import DetailRekap from './Page/Guru/Rekap/Detail/Detail';
import ChatMentor from './Page/Mentor/Chat/Chat';
import ChatGuru from './Page/Guru/Chat/Chat';

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
        <Route path='/siswa/todo/detail/:id' element={<Layout><Detail /></Layout>} />
        <Route path='/siswa/todo/edit/:id' element={<Layout><Edit /></Layout>} />
        <Route path='/AttendanceSiswa' element={<Layout><Attendance /></Layout>} />
        <Route path='/ChatSiswa' element={<Layout><Chat /></Layout>} />
        <Route path='/ReportSiswa' element={<Layout><Report /></Layout>} />
        <Route path='/ProfileSiswa' element={<Layout><Profile /></Layout>} />
        <Route path='/DashboardSuperAdmin' element={<Layout><DashboardSuperAdmin /></Layout>} />
        
        {/* Mentor Routes with /mentor prefix */}
        <Route path='/mentor/dashboard' element={<Layout><DashboardMentor /></Layout>} />
        <Route path='/mentor/tugas' element={<Layout><TugasMentor /></Layout>} />
        <Route path='/mentor/tugas/tambah' element={<Layout><TambahTugas /></Layout>} />
        <Route path='/mentor/tugas/edit/:id' element={<Layout><EditTugas /></Layout>} />
        <Route path='/mentor/absensi' element={<Layout><DataAbsensiMentor /></Layout>} />
        <Route path='/mentor/rekap' element={<Layout><DataRekapMentor /></Layout>} />
        <Route path='/mentor/chat' element={<Layout><ChatMentor /></Layout>} />

        {/* Guru Routes with /guru prefix */}
        <Route path='/guru/dashboard' element={<Layout><DashboardGuru /></Layout>} />
        <Route path='/guru/tugas' element={<Layout><DataTugasGuru /></Layout>} />
        <Route path='/guru/absensi' element={<Layout><DataAbsensiGuru /></Layout>} />
        <Route path='/guru/rekap' element={<Layout><DataRekapGuru /></Layout>} />
        <Route path='/guru/chat' element={<Layout><ChatGuru /></Layout>} />
        
        {/* Guru Detail Routes */}
        <Route path='/guru/tugas/detail/:id' element={<Layout><DetailTugas /></Layout>} />
        <Route path='/guru/absensi/detail/:id' element={<Layout><DetailAbsensi /></Layout>} />
        <Route path='/guru/rekap/detail/:id' element={<Layout><DetailRekap /></Layout>} />
        
        <Route path='/UserManagement' element={<Layout><UserManagement /></Layout>} />
        <Route path='/UserManagement/tambah' element={<Layout><TambahUser /></Layout>} />
        <Route path='/UserManagement/edit/:id' element={<Layout><EditUser /></Layout>} />
        <Route path='/Institusi' element={<Layout><Institusi /></Layout>} />
        <Route path='/Institusi/tambah' element={<Layout><TambahInstitusi /></Layout>} />
        <Route path='/Institusi/edit/:id' element={<Layout><EditInstitusi /></Layout>} />
        <Route path='/DataTugas' element={<Layout><DataTugas /></Layout>} />
        <Route path='/DataJadwal' element={<Layout><DataJadwal /></Layout>} />
        <Route path='/DataJadwal/tambah' element={<Layout><TambahJadwal /></Layout>} />
        <Route path='/DataJadwal/edit/:id' element={<Layout><EditJadwal /></Layout>} />
        <Route path='/DataAbsensi' element={<Layout><DataAbsensi /></Layout>} />
        <Route path='/DataMentorSiswa' element={<Layout><DataMentorSiswa /></Layout>} />
        <Route path='/DataMentorSiswa/tambah' element={<Layout><TambahMentorSiswa /></Layout>} />
        <Route path='/DataMentorSiswa/edit/:id' element={<Layout><EditMentorSiswa /></Layout>} />
        <Route path='/DataGuruSiswa' element={<Layout><DataGuruSiswa /></Layout>} />
        <Route path='/DataGuruSiswa/tambah' element={<Layout><TambahGuruSiswa /></Layout>} />
        <Route path='/DataGuruSiswa/edit/:id' element={<Layout><EditGuruSiswa /></Layout>} />
        <Route path='/DataGuruSiswa/detail/:id' element={<Layout><DetailGuruSiswa /></Layout>} />
        <Route path='/DataRekap' element={<Layout><DataRekap /></Layout>} />
        <Route path='/DataAbsensiMentor' element={<Layout><DataAbsensiMentor /></Layout>} />
        <Route path='/DataRekapMentor' element={<Layout><DataRekapMentor /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
