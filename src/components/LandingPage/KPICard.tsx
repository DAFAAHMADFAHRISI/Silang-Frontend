import React from 'react';

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
