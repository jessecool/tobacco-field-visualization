import React from 'react';
import { TobaccoField, SortField, SortOrder } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps {
  data: TobaccoField[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onRowClick: (field: TobaccoField) => void;
  selectedId?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  sortField, 
  sortOrder, 
  onSort, 
  onRowClick,
  selectedId 
}) => {
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-300 ml-1 inline" />;
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="text-tobacco-600 ml-1 inline" />
      : <ArrowDown size={14} className="text-tobacco-600 ml-1 inline" />;
  };

  const headers: { label: string; key: SortField }[] = [
    { label: '村', key: 'village' },
    { label: '烟农', key: 'farmerName' },
    { label: '面积 (亩)', key: 'area' },
    { label: '亩产 (kg)', key: 'yieldPerMu' },
    { label: '株数', key: 'plantCount' },
    { label: '预估产量 (kg)', key: 'estimatedYield' },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-medium uppercase border-b border-slate-200">
          <tr>
            {headers.map((header) => (
              <th 
                key={header.key}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                onClick={() => onSort(header.key)}
              >
                {header.label}
                <SortIcon field={header.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr 
              key={row.id} 
              className={`
                cursor-pointer hover:bg-slate-50 transition-colors
                ${selectedId === row.id ? 'bg-tobacco-50 border-l-4 border-tobacco-500' : ''}
              `}
              onClick={() => onRowClick(row)}
            >
              <td className="px-4 py-3 font-medium text-slate-800">{row.village}</td>
              <td className="px-4 py-3">{row.farmerName}</td>
              <td className="px-4 py-3 text-emerald-600 font-medium">{row.area.toFixed(2)}</td>
              <td className="px-4 py-3">{row.yieldPerMu.toFixed(1)}</td>
              <td className="px-4 py-3">{row.plantCount}</td>
              <td className="px-4 py-3 font-semibold text-slate-700">{row.estimatedYield.toFixed(1)}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                暂无数据，请上传 KML 文件
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
