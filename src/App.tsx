import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Page/Auth/Register';
import Dashboard from './Page/landingpages';
import Login from './Page/Auth/Login';
import DashboardSiswa from './Page/Siswa/Dashboard';
import Todo from './Page/Siswa/Todo/Todo';
import Detail from './Page/Siswa/Todo/Detail/Detail';
import Edit from './Page/Siswa/Todo/Edit/Edit';
import SubmitPage from './Page/Siswa/Todo/Tambah/Tambah';
import Attendance from './Page/Siswa/Absensi/Attendance';
import Chat from './Page/Siswa/Chat/Chat';
import Report from './Page/Siswa/Report';
import Layout from './Layout/Layout';
import Profile from './Page/Siswa/Profile';
import ReserPassword from './Page/Siswa/ResetPassword';
import ResetPassword from './Page/ResetPassword';
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
import DetailTugasSuperAdmin from './Page/SuperAdmin/Tugas/detail/detail';
import DataJadwal from './Page/SuperAdmin/Jadwal/Data Jadwal';
import TambahJadwal from './Page/SuperAdmin/Jadwal/Tambah/Tambah';
import EditJadwal from './Page/SuperAdmin/Jadwal/Edit/Edit';
import DataAbsensi from './Page/SuperAdmin/Absensi/Data Absensi';
import DetailAbsensiSuperAdmin from './Page/SuperAdmin/Absensi/detail/detail';
import DataMentorSiswa from './Page/SuperAdmin/Data Mentor Siswa/Data Mentor-Siswa';
import TambahMentorSiswa from './Page/SuperAdmin/Data Mentor Siswa/Tambah/Tambah';
import EditMentorSiswa from './Page/SuperAdmin/Data Mentor Siswa/Edit/Edit';
import DetailMentorSiswa from './Page/SuperAdmin/Data Mentor Siswa/detail/detail';
import DataGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Data Guru - Siswa';
import TambahGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Tambah/Tambah';
import EditGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Edit/Edit';
import DetailGuruSiswa from './Page/SuperAdmin/Data Guru Siswa/Detail/Detail';
import DataRekap from './Page/SuperAdmin/Data Rekap/Data Rekap';
import DetailRekapSuperAdmin from './Page/SuperAdmin/Data Rekap/detail/detail';
import TugasMentor from './Page/Mentor/Tugas/TugasMentor';
import TambahTugas from './Page/Mentor/Tugas/Tambah/Tambah';
import EditTugas from './Page/Mentor/Tugas/Edit/Edit';
import DetailTugasMentor from './Page/Mentor/Tugas/Detail/Detail';
import DataAbsensiMentor from './Page/Mentor/Absensi/Data Absensi';
import DataRekapMentor from './Page/Mentor/Rekap/Data Rekap';
import ChatMentor from './Page/Mentor/Chat/Chat';
import DataTugasGuru from './Page/Guru/Tugas/Data Tugas';
import DataAbsensiGuru from './Page/Guru/Absensi/Data Absensi';
import DataRekapGuru from './Page/Guru/Rekap/Data Rekap';
import DetailTugas from './Page/Guru/Tugas/Detail/Detail';
import DetailAbsensi from './Page/Guru/Absensi/Detail/Detail';
import DetailRekap from './Page/Guru/Rekap/Detail/Detail';
import ChatGuru from './Page/Guru/Chat/Chat';
import ProfileGuru from './Page/Guru/Profile';
import ResetPasswordGuru from './Page/Guru/ResetPassword';
import ProfileMentor from './Page/Mentor/Profile';
import ResetPasswordMentor from './Page/Mentor/ResetPassword';
import Mwork from './Page/Mentor/Mwork/Mwork';
import LoadingRole from './Page/LoadingRole';
import GoogleCallback from './Page/GoogleCallback';
import AuthError from './Page/AuthError';
import ErrorBoundary from './components/ErrorBoundary';
import ToastManager from './components/ToastManager';
import ErrorHandler from './components/ErrorHandler';
import ProtectedRoute from './components/ProtectedRoute';
import Sertifikat from './Page/SuperAdmin/Sertifikat/Sertifikat';
import SiswaSertifikat from './Page/Siswa/sertifikat/sertifikat';
import Work from './Page/Siswa/work/work';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastManager>
        <Router>
          <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/google-callback' element={<GoogleCallback />} />
        <Route path='/auth-error' element={<AuthError />} />
        <Route path='/auth-error.html' element={<AuthError />} />
        <Route path='/LoadingRole' element={<Layout><LoadingRole /></Layout>} />
        
        {/* Siswa Routes */}
        <Route path='/DashboardSiswa' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><DashboardSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/TodoSiswa' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Todo /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/siswa/todo/detail/:id' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Detail /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/siswa/todo/edit/:id' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Edit /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/siswa/todo/submit/:id' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><SubmitPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/AttendanceSiswa' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Attendance /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/ChatSiswa' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Chat /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/ReportSiswa' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Report /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/ProfileSiswa' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/ReserPassword' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><ReserPassword /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/ReserPassword/Token' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><ReserPassword /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/ResetPassword' element={<ResetPassword />} />
        <Route path='/ResetPassword/Token' element={<ResetPassword />} />

        {/* SuperAdmin Routes */}
        <Route path='/DashboardSuperAdmin' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DashboardSuperAdmin /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Institusi' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><Institusi /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Institusi/tambah' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><TambahInstitusi /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Institusi/edit/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><EditInstitusi /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/UserManagement' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><UserManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/UserManagement/tambah' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><TambahUser /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/UserManagement/edit/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><EditUser /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataTugas' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DataTugas /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataJadwal' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DataJadwal /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/SuperAdmin/Tugas/detail/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DetailTugasSuperAdmin /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataJadwal/tambah' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><TambahJadwal /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataJadwal/edit/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><EditJadwal /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataAbsensi' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DataAbsensi /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataAbsensi/detail/:studentName/:month/:date' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DetailAbsensiSuperAdmin /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataMentorSiswa' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DataMentorSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataMentorSiswa/detail/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DetailMentorSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataMentorSiswa/tambah' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><TambahMentorSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataMentorSiswa/edit/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><EditMentorSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataGuruSiswa' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DataGuruSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataGuruSiswa/tambah' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><TambahGuruSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataGuruSiswa/edit/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><EditGuruSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataGuruSiswa/detail/:id' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DetailGuruSiswa /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataRekap' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DataRekap /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/DataRekap/detail' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><DetailRekapSuperAdmin /></Layout>
          </ProtectedRoute>
        } />

        {/* Mentor Routes */}
        <Route path='/mentor/dashboard' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><DashboardMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/tugas' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><TugasMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/tugas/tambah' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><TambahTugas /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/tugas/edit/:id' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><EditTugas /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/tugas/detail/:id' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><DetailTugasMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/absensi' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><DataAbsensiMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/rekap' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><DataRekapMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/chat' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><ChatMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Mentor/Profile' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><ProfileMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Mentor/ResetPassword' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><ResetPasswordMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Mentor/ResetPassword/Token' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><ResetPasswordMentor /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/mentor/work-assignments' element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Layout><Mwork /></Layout>
          </ProtectedRoute>
        } />

        {/* Guru Routes */}
        <Route path='/guru/dashboard' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><DashboardGuru /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/guru/tugas' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><DataTugasGuru /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/guru/absensi' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><DataAbsensiGuru /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/guru/rekap' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><DataRekapGuru /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/guru/tugas/detail/:id' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><DetailTugas /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/guru/absensi/detail/:id' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><DetailAbsensi /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/guru/rekap/detail/:id' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><DetailRekap /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/guru/chat' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><ChatGuru /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Guru/Profile' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><ProfileGuru /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Guru/ResetPassword' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><ResetPasswordGuru /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/Guru/ResetPassword/Token' element={
          <ProtectedRoute allowedRoles={['guru']}>
            <Layout><ResetPasswordGuru /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Sertifikat Routes */}
        <Route path='/Sertifikat' element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout><Sertifikat /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/SiswaSertifikat' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><SiswaSertifikat /></Layout>
          </ProtectedRoute>
        } />
        <Route path='/siswa/work-assignments' element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <Layout><Work /></Layout>
          </ProtectedRoute>
        } />
        
        {/* 404 Route - Must be last */}
        <Route path="*" element={<ErrorHandler />} />
        </Routes>
        </Router>
      </ToastManager>
    </ErrorBoundary>
  );
}

export default App;
