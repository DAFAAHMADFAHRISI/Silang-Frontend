import React, { useEffect, useState } from 'react';
import { UserCheck, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle, Award, Users, Mail } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Attendance
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Riwayat kehadiran dan absensi siswa.</p>
      </div>
      <Divider />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none border border-gray-700 w-full md:w-64"
        />
        <div className="flex gap-2 items-center">
          <select className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700">
            <option>Juli</option>
          </select>
          <select className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700">
            <option>2025</option>
          </select>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
            <span className="mr-1">⟳</span> Refresh
          </button>
          <button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded flex items-center">
            <span className="mr-1">⏺</span> Check In/Out
          </button>
        </div>
      </div>
      <Divider />
      <div className="overflow-x-auto rounded-lg">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : (
        <table className="min-w-full bg-gray-900 border border-gray-700 text-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-2 py-3 text-left"><input type="checkbox" /></th>
              <th className="px-2 py-3 text-left">#</th>
              <th className="px-2 py-3 text-left">Tanggal</th>
              <th className="px-2 py-3 text-left">Foto In</th>
              <th className="px-2 py-3 text-left">Check In</th>
              <th className="px-2 py-3 text-left">Telat</th>
              <th className="px-2 py-3 text-left">Lokasi In</th>
              <th className="px-2 py-3 text-left">Foto Out</th>
              <th className="px-2 py-3 text-left">Check Out</th>
              <th className="px-2 py-3 text-left">Lokasi Out</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((row, idx) => (
              <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="px-2 py-2"><input type="checkbox" /></td>
                <td className="px-2 py-2">{idx + 1}</td>
                <td className="px-2 py-2">{row.date}</td>
                <td className="px-2 py-2">
                  {row.photoIn && row.photoIn !== '-' ? (
                    <img src={row.photoIn} alt="foto in" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-2 py-2">{row.checkIn}</td>
                <td className={`px-2 py-2 ${row.lateClass || ''}`}>{row.late}</td>
                <td className="px-2 py-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">View Map</button>
                </td>
                <td className="px-2 py-2">
                  {row.photoOut && row.photoOut !== '-' ? (
                    <img src={row.photoOut} alt="foto out" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-2 py-2">{row.checkOut}</td>
                <td className="px-2 py-2">
                  {row.locationOut && row.locationOut !== '-' ? (
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">View Map</button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      <Divider />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-white">Rows:</span>
          <select className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700">
            <option>10</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-800 text-gray-400 px-3 py-2 rounded" disabled>{'<<'}</button>
          <span className="text-white">Page 1 of 1</span>
          <button className="bg-gray-800 text-gray-400 px-3 py-2 rounded" disabled>{'>>'}</button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
