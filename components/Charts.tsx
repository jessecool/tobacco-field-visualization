import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TobaccoField } from '../types';

interface ChartsProps {
  data: TobaccoField[];
}

export const VillageChart: React.FC<ChartsProps> = ({ data }) => {
  // Aggregate data by Village
  const aggregated = React.useMemo(() => {
    const map = new Map<string, { name: string, area: number, yield: number }>();
    
    data.forEach(item => {
      if (!map.has(item.village)) {
        map.set(item.village, { name: item.village, area: 0, yield: 0 });
      }
      const current = map.get(item.village)!;
      current.area += item.area;
      current.yield += item.estimatedYield;
    });

    return Array.from(map.values());
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
      <h3 className="text-lg font-bold text-slate-800 mb-4">各村种植情况对比</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={aggregated}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
          <YAxis yAxisId="left" orientation="left" stroke="#10b981" label={{ value: '面积 (亩)', angle: -90, position: 'insideLeft', fill: '#10b981' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" label={{ value: '产量 (kg)', angle: 90, position: 'insideRight', fill: '#f59e0b' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => value.toFixed(1)}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="area" name="种植面积" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar yAxisId="right" dataKey="yield" name="预估产量" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
