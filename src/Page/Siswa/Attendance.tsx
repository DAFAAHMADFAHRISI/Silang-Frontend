import React, { useEffect, useState } from 'react';
import { UserCheck, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle, Award, Users, Mail } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-6 sm:my-8 w-full" />;

interface AttendanceRow {
  name: string;
  date: string;
  photoIn: string;
  checkIn: string;
  late: string;
  lateClass?: string;
  locationIn: string;
  photoOut: string;
  checkOut: string;
  locationOut: string;
}

// Hapus AttendanceCard dan bagian avatar/email, cukup tampilkan nama di tabel

const Attendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3000/API/siswa/attendance');
        const json = await res.json();
        if (json.data) {
          const mapped = json.data.map((item: any) => {
            // Format tanggal dan jam
            const checkInDate = new Date(item.waktu_check_in);
            const checkOutDate = item.waktu_check_out ? new Date(item.waktu_check_out) : null;
            const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour12: false });

            // Hitung telat
            const batasTelat = new Date(checkInDate);
            batasTelat.setHours(8, 0, 0, 0); // jam 08:00:00
            let late = 'On Time';
            let lateClass = '';
            if (checkInDate >= batasTelat) {
              const diffMs = checkInDate.getTime() - batasTelat.getTime();
              const diffMinutes = Math.floor(diffMs / 60000);
              const jam = Math.floor(diffMinutes / 60);
              const menit = diffMinutes % 60;
              if (jam > 0) {
                late = `${jam} jam ${menit} menit`;
              } else {
                late = `${menit} menit`;
              }
              lateClass = 'text-red-400';
            }

            return {
              name: `Siswa ${item.siswa_id}`,
              date: formatDate(checkInDate),
              photoIn: item.checkinface ? `/${item.checkinface}` : '-',
              checkIn: formatTime(checkInDate),
              late,
              lateClass,
              locationIn: '#',
              photoOut: item.checkoutface ? `/${item.checkoutface}` : '-',
              checkOut: checkOutDate ? formatTime(checkOutDate) : '-',
              locationOut: '#',
            };
          });
          setAttendanceData(mapped);
        }
      } catch (err) {
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 mt-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Attendance
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Riwayat kehadiran dan absensi siswa.</p>
      </div>
      
      <Divider />
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded focus:outline-none border border-gray-700 w-full sm:w-64 text-sm sm:text-base"
        />
        <div className="flex gap-2 items-center">
          <select className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700 text-xs sm:text-sm">
            <option>Juli</option>
          </select>
          <select className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700 text-xs sm:text-sm">
            <option>2025</option>
          </select>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded flex items-center text-xs sm:text-sm">
            <span className="mr-1">⟳</span> Refresh
          </button>
        </div>
      </div>
      
      <Divider />
      
      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Name</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Date</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Check In</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Late</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Check Out</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((row, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-3 px-2 sm:px-4 text-white">{row.name}</td>
                <td className="py-3 px-2 sm:px-4 text-gray-300">{row.date}</td>
                <td className="py-3 px-2 sm:px-4 text-green-400 font-medium">{row.checkIn}</td>
                <td className={`py-3 px-2 sm:px-4 font-medium ${row.lateClass || 'text-green-400'}`}>
                  {row.late}
                </td>
                <td className="py-3 px-2 sm:px-4 text-blue-400 font-medium">{row.checkOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Divider />
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs sm:text-sm">Rows:</span>
          <select className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 text-xs sm:text-sm">
            <option>6</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-800 text-gray-400 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm" disabled>{'<<'}</button>
          <span className="text-white text-xs sm:text-sm">Page 1 of 1</span>
          <button className="bg-gray-800 text-gray-400 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm" disabled>{'>>'}</button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
