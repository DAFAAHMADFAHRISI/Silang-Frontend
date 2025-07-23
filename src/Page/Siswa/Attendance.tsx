import React from 'react';

const Divider = () => <div className="border-t border-white/30 my-6 w-full" />;

const attendanceData = [
  {
    name: 'Dafa Ahmad Fahrisi',
    date: '23 Juli 2025',
    photoIn: '/profile1.jpg',
    checkIn: '06:56:37',
    late: 'On Time',
    locationIn: '#',
    photoOut: '-',
    checkOut: '-',
    locationOut: '-',
  },
  {
    name: 'Dafa Ahmad Fahrisi',
    date: '22 Juli 2025',
    photoIn: '/profile2.jpg',
    checkIn: '07:00:40',
    late: '40 detik',
    locationIn: '#',
    photoOut: '/profile2.jpg',
    checkOut: '15:31:13',
    locationOut: '#',
  },
  {
    name: 'Dafa Ahmad Fahrisi',
    date: '21 Juli 2025',
    photoIn: '/profile3.jpg',
    checkIn: '06:52:53',
    late: 'On Time',
    locationIn: '#',
    photoOut: '/profile3.jpg',
    checkOut: '15:32:27',
    locationOut: '#',
  },
  {
    name: 'Dafa Ahmad Fahrisi',
    date: '18 Juli 2025',
    photoIn: '/profile4.jpg',
    checkIn: '06:58:08',
    late: 'On Time',
    locationIn: '#',
    photoOut: '/profile4.jpg',
    checkOut: '11:32:45',
    locationOut: '#',
  },
  {
    name: 'Dafa Ahmad Fahrisi',
    date: '17 Juli 2025',
    photoIn: '/profile5.jpg',
    checkIn: '07:09:09',
    late: '9 menit 9 detik',
    locationIn: '#',
    photoOut: '/profile5.jpg',
    checkOut: '15:32:47',
    locationOut: '#',
  },
  {
    name: 'Dafa Ahmad Fahrisi',
    date: '16 Juli 2025',
    photoIn: '/profile6.jpg',
    checkIn: '07:00:11',
    late: '11 detik',
    locationIn: '#',
    photoOut: '/profile6.jpg',
    checkOut: '15:33:21',
    locationOut: '#',
  },
  {
    name: 'Dafa Ahmad Fahrisi',
    date: '15 Juli 2025',
    photoIn: '/profile7.jpg',
    checkIn: '07:20:54',
    late: '20 menit 54 detik',
    locationIn: '#',
    photoOut: '/profile7.jpg',
    checkOut: '15:37:31',
    locationOut: '#',
  },
];

const Attendance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pt-1 px-6 pb-6">
      <h1 className="text-3xl font-bold text-white mb-4">Attendance</h1>
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
        <table className="min-w-full bg-gray-900 border border-gray-700 text-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-2 py-3 text-left"><input type="checkbox" /></th>
              <th className="px-2 py-3 text-left">#</th>
              <th className="px-2 py-3 text-left">Nama</th>
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
                <td className="px-2 py-2">{row.name}</td>
                <td className="px-2 py-2">{row.date}</td>
                <td className="px-2 py-2">
                  {row.photoIn && row.photoIn !== '-' ? (
                    <img src={row.photoIn} alt="foto in" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-2 py-2">{row.checkIn}</td>
                <td className={`px-2 py-2 ${row.late !== 'On Time' ? 'text-red-400' : ''}`}>{row.late}</td>
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
      </div>
      <Divider />
      {/* Pagination and Rows */}
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
