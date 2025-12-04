import React, { useState, useMemo, useEffect } from 'react';
import { 
  TobaccoField, 
  Stats, 
  SortField, 
  SortOrder, 
  ViewMode, 
  VisualizationMetric 
} from './types';
import { MOCK_DATA } from './constants';
import { StatsCards } from './components/StatsCards';
import { TobaccoMap } from './components/TobaccoMap';
import { DataTable } from './components/DataTable';
import { VillageChart } from './components/Charts';
import { FileUploader } from './components/FileUploader';
import { Map as MapIcon, Layers, BarChart3, List, Sprout } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [data, setData] = useState<TobaccoField[]>(MOCK_DATA);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.POLYGON);
  const [metric, setMetric] = useState<VisualizationMetric>(VisualizationMetric.AREA);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [sortField, setSortField] = useState<SortField>('area');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Derived Statistics
  const stats: Stats = useMemo(() => {
    const totalArea = data.reduce((sum, item) => sum + item.area, 0);
    const totalYield = data.reduce((sum, item) => sum + item.estimatedYield, 0);
    const uniqueFarmers = new Set(data.map(item => item.farmerName)).size;
    
    return {
      totalArea,
      totalYield,
      totalFarmers: uniqueFarmers,
      totalFields: data.length,
      avgYieldPerMu: totalArea > 0 ? totalYield / totalArea : 0
    };
  }, [data]);

  // Sorting Logic
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal, 'zh-CN') 
          : bVal.localeCompare(aVal, 'zh-CN');
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending for new metrics like Area/Yield
    }
  };

  const handleFieldSelect = (field: TobaccoField) => {
    setSelectedFieldId(field.id);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-tobacco-600 p-2 rounded-lg">
            <Sprout className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">烤烟地块分布可视化系统</h1>
            <p className="text-xs text-slate-500">Tobacco Field Geospatial Intelligence</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="md:hidden p-2 bg-slate-100 rounded-md"
           >
             <List size={20} />
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content (Map & Stats) */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          
          {/* Top Row: Stats & Controls */}
          <div className="mb-6">
            <StatsCards stats={stats} />
            
            {/* Visual Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-700 mr-2">图层模式:</span>
                <button
                  onClick={() => setViewMode(ViewMode.POLYGON)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    viewMode === ViewMode.POLYGON ? 'bg-tobacco-100 text-tobacco-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MapIcon size={16} /> <span>地块分布</span>
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.HEATMAP)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    viewMode === ViewMode.HEATMAP ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers size={16} /> <span>热力图</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-700 mr-2">渲染指标:</span>
                <select 
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-tobacco-500 focus:border-tobacco-500 block p-2"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as VisualizationMetric)}
                >
                  <option value={VisualizationMetric.AREA}>种植面积 (Area)</option>
                  <option value={VisualizationMetric.YIELD}>预估产量 (Yield)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 min-h-[400px] mb-6 relative">
            <TobaccoMap 
              data={data} 
              viewMode={viewMode}
              metric={metric}
              selectedFieldId={selectedFieldId}
              onFieldSelect={handleFieldSelect}
            />
            
            {/* Legend Overlay */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 z-[400] text-sm">
              <h4 className="font-bold text-slate-700 mb-2">
                {metric === VisualizationMetric.AREA ? '面积等级 (亩)' : '亩产等级 (kg)'}
              </h4>
              <div className="space-y-1">
                {metric === VisualizationMetric.AREA ? (
                  <>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#14532d] mr-2"></span> &gt; 20 亩</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#15803d] mr-2"></span> 10 - 20 亩</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#22c55e] mr-2"></span> 5 - 10 亩</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#86efac] mr-2"></span> &lt; 5 亩</div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#7f1d1d] mr-2"></span> &gt; 160 kg</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#b91c1c] mr-2"></span> 140 - 160 kg</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#ef4444] mr-2"></span> 130 - 140 kg</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-[#fca5a5] mr-2"></span> &lt; 130 kg</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Charts Area */}
          <div className="mb-6">
            <VillageChart data={data} />
          </div>

        </main>

        {/* Sidebar: Data & Upload */}
        <aside className={`
          bg-white border-l border-slate-200 w-96 flex-shrink-0 flex flex-col transition-all duration-300
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full shadow-2xl'}
        `}>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
             <h2 className="font-bold text-slate-800 flex items-center">
               <BarChart3 className="mr-2" size={20}/> 数据列表
             </h2>
             <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{data.length} 条记录</span>
          </div>

          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <FileUploader onDataLoaded={setData} />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <DataTable 
              data={sortedData} 
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onRowClick={handleFieldSelect}
              selectedId={selectedFieldId}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
