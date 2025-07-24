import React from 'react';
import { TrendingUp, Award, Users } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

interface ReportRow {
  name: string;
  institution: string;
  totalTasks: number;
  completedTasks: number;
  totalValue: number;
  averageValue: number;
}

const reportData: ReportRow[] = [
  {
    name: 'Dafa Ahmad Fahrisi',
    institution: 'Politeknik Elektronika Negeri Surabaya',
    totalTasks: 3,
    completedTasks: 2,
    totalValue: 170,
    averageValue: 56.6667,
  },
];

const ReportCard = ({ row }: { row: ReportRow }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-700/50 mb-4">
    <div className="flex items-center space-x-4 mb-2">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Users className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-lg text-white mb-1">{row.name}</h3>
        <p className="text-gray-400 text-sm">{row.institution}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-yellow-400" />
        <span>Total Tasks: {row.totalTasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-blue-400" />
        <span>Completed: {row.completedTasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-green-400" />
        <span>Total Value: {row.totalValue}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-purple-400" />
        <span>Average: {row.averageValue.toFixed(2)}</span>
      </div>
    </div>
  </div>
);

const Report: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Student Task Report
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Laporan tugas dan nilai siswa.</p>
      </div>
      <Divider />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none border border-gray-700 w-full md:w-64"
        />
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
          <span className="mr-1">⟳</span> Refresh
        </button>
      </div>
      <Divider />
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <span>Report Siswa</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData.map((row, idx) => (
            <ReportCard key={idx} row={row} />
          ))}
        </div>
      </div>
      <Divider />
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full bg-gray-900 border border-gray-700 text-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-2 py-3 text-left">#</th>
              <th className="px-2 py-3 text-left">Name</th>
              <th className="px-2 py-3 text-left">Institution</th>
              <th className="px-2 py-3 text-left">Total Tasks</th>
              <th className="px-2 py-3 text-left">Completed Tasks</th>
              <th className="px-2 py-3 text-left">Total Value</th>
              <th className="px-2 py-3 text-left">Average Value</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="px-2 py-2">{idx + 1}</td>
                <td className="px-2 py-2">{row.name}</td>
                <td className="px-2 py-2">{row.institution}</td>
                <td className="px-2 py-2">{row.totalTasks}</td>
                <td className="px-2 py-2">{row.completedTasks}</td>
                <td className="px-2 py-2">{row.totalValue}</td>
                <td className="px-2 py-2">{row.averageValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default Report;
