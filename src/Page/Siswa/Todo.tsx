import React from 'react';

const Divider = () => <div className="border-t border-white/30 my-6 w-full" />;

const tasks = [
  {
    title: 'Lakukan test dan debug pada aplikasi silang',
    description: 'link github: https://github.com/kominfo-sampang/silang-next-js - buatkan laporan dokumentasi hasil testing - apa saja yang error dan perlu di tingkatkan - laporan berupa file pdf',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '16 Juli 2025 pukul 07.00',
    createdBy: 'Ainun Nawawi',
    assignees: [
      { name: 'Dafa Ahmad Fahrisi', score: 85 },
      { name: 'Agiel Maula', score: 85 },
    ],
    created: '8 hari yang lalu',
    updated: 'sehari yang lalu',
  },
  {
    title: 'Lakukan Analisis dan Desain Arsitektur Aplikasi Silang',
    description: 'kumpulkan dalam bentuk pdf',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '23 Juli 2025 pukul 07.00',
    createdBy: 'Ainun Nawawi',
    assignees: [
      { name: 'Dafa Ahmad Fahrisi', score: 0 },
      { name: 'Agiel Maula', score: 0 },
    ],
    created: '7 hari yang lalu',
    updated: 'sehari yang lalu',
  },
  {
    title: 'Buat SOP Si Aladin',
    description: 'Buatkan tutorial secara lengkap',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '24 Juli 2025 pukul 07.00',
    createdBy: 'Ainun Nawawi',
    assignees: [
      { name: 'Dafa Ahmad Fahrisi', score: 85 },
    ],
    created: 'sehari yang lalu',
    updated: 'sehari yang lalu',
  },
];

const Todo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pt-1 px-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">To Do Management</h1>
        <div className="flex flex-1 md:justify-end gap-2 items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none border border-gray-700 w-full md:w-64"
          />
          <div className="flex gap-2">
            <select className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700">
              <option>Juli</option>
            </select>
            <select className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700">
              <option>2025</option>
            </select>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
            <span className="mr-1">⟳</span> Refresh
          </button>
        </div>
      </div>
      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tasks.map((task, idx) => (
          <div key={idx} className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-white flex flex-col">
            <div className="mb-2">
              <span className="text-lg font-semibold">Title</span>
              <h2 className="text-2xl font-bold leading-tight">{task.title}</h2>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-400">Description</span>
              <div className="text-base">{task.description}</div>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-400">Attachments</span>
              <div>-</div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-semibold">Priority {task.priority}</span>
              {task.status === 'Completed' ? (
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">Completed</span>
              ) : (
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">In Progress</span>
              )}
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-400">Due Date</span>
              <div>{task.dueDate}</div>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-400">Created By</span>
              <div>
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">{task.createdBy}</span>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-400">Assignees</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {task.assignees.map((a, i) => (
                  <span key={i} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    {a.name} ({a.score})
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-400">Created</span>
              <div>{task.created}</div>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-400">Updated</span>
              <div className="flex items-center gap-2">
                {task.updated}
                <button className="bg-green-600 hover:bg-green-700 text-white p-1 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Divider />
      {/* Pagination and Rows */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white">Rows:</span>
          <select className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700">
            <option>6</option>
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

export default Todo;
