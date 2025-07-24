import React from 'react';
import { Calendar, TrendingUp, CheckCircle, AlertCircle, Award, Users } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

interface Task {
  title: string;
  description: string;
  priority: string;
  status: 'In Progress' | 'Completed';
  dueDate: string;
  createdBy: string;
  assignees: { name: string; score: number }[];
  created: string;
  updated: string;
}

const tasks: Task[] = [
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

const TaskCard = ({ task }: { task: Task }) => {
  const statusConfig: Record<string, { bg: string; icon: React.ReactElement; statusText: string }> = {
    'In Progress': {
      bg: 'bg-gradient-to-br from-orange-500 to-red-500',
      icon: <AlertCircle className="w-5 h-5" />,
      statusText: 'In Progress',
    },
    Completed: {
      bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
      icon: <CheckCircle className="w-5 h-5" />,
      statusText: 'Completed',
    },
  };
  const config = statusConfig[task.status] || statusConfig['In Progress'];
  return (
    <div className={`${config.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-lg leading-tight pr-4">{task.title}</h3>
        <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {config.icon}
          <span className="ml-1">{config.statusText}</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Due: {task.dueDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Score: {task.assignees[0]?.score ?? 0}</span>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-sm leading-relaxed">{task.description}</p>
        </div>
      </div>
    </div>
  );
};

const Todo: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            To Do Management
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Kelola tugas harian siswa.</p>
      </div>
      <Divider />
      <div className="flex flex-1 md:justify-end gap-2 items-center mb-6">
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
      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tasks.map((task, idx) => (
          <TaskCard key={idx} task={task} />
        ))}
      </div>
      <Divider />
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
