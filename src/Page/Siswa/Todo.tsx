import React from 'react';
import { Calendar, TrendingUp, CheckCircle, AlertCircle, Award, Users } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-6 sm:my-8 w-full" />;

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
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      statusText: 'In Progress',
    },
    Completed: {
      bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
      icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      statusText: 'Completed',
    },
  };
  const config = statusConfig[task.status] || statusConfig['In Progress'];
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-1 truncate">{task.title}</h3>
        </div>
        <div className={`${config.bg} rounded-lg p-2 sm:p-3 ml-3 flex-shrink-0 flex items-center space-x-1`}>
          {config.icon}
          <span className="text-xs sm:text-sm font-medium ml-1">{config.statusText}</span>
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <span className="text-gray-400">Due:</span>
            <span className="text-white font-medium">{task.dueDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <span className="text-gray-400">Score:</span>
            <span className="text-white font-bold">{task.assignees[0]?.score ?? 0}/100</span>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs sm:text-sm leading-relaxed text-gray-300">{task.description}</p>
        </div>
        
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Created by:</span>
          <span className="text-white font-medium">{task.createdBy}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Updated:</span>
          <span className="text-gray-300">{task.updated}</span>
        </div>
      </div>
    </div>
  );
};

const Todo: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 mt-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            To Do List
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Kelola tugas dan aktivitas Anda.</p>
      </div>

      <Divider />

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {tasks.map((task, index) => (
          <TaskCard key={index} task={task} />
        ))}
      </div>

      <Divider />
    </div>
  );
};

export default Todo;

