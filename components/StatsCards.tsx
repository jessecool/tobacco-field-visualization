import React from 'react';
import { Stats } from '../types';
import { Sprout, Scale, Map as MapIcon, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: Stats;
}

const Card: React.FC<{ title: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg ${color} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card 
        title="总种植面积" 
        value={`${stats.totalArea.toFixed(1)} 亩`} 
        icon={<MapIcon size={24} />}
        color="bg-emerald-500"
      />
      <Card 
        title="预估总产量" 
        value={`${(stats.totalYield / 1000).toFixed(2)} 吨`}
        sub={`${stats.totalYield.toLocaleString()} 公斤`}
        icon={<Scale size={24} />}
        color="bg-amber-500"
      />
      <Card 
        title="涉及烟农" 
        value={`${stats.totalFarmers} 户`}
        sub={`共 ${stats.totalFields} 个地块`}
        icon={<Users size={24} />}
        color="bg-blue-500"
      />
      <Card 
        title="平均亩产" 
        value={`${stats.avgYieldPerMu.toFixed(1)} 公斤`}
        icon={<Sprout size={24} />}
        color="bg-indigo-500"
      />
    </div>
  );
};
