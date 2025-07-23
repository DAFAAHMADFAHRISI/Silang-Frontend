import React from 'react';

const Divider = () => <div className="border-t border-white/30 my-6 w-full" />;

const reportData = [
  {
    name: 'Dafa Ahmad Fahrisi',
    institution: 'Politeknik Elektronika Negeri Surabaya',
    totalTasks: 3,
    completedTasks: 2,
    totalValue: 170,
    averageValue: 56.6667,
  },
];

const Report: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pt-1 px-6 pb-6">
      <h1 className="text-3xl font-bold text-white mb-4">Student Task Report</h1>
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
                <td className="px-2 py-2">{row.averageValue}</td>
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

export default Report;
