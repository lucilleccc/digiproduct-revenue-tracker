import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RevenueEntry, IncomeSource } from '../types';
import { formatCurrency } from '../lib/utils';

interface SourceBreakdownProps {
  entries: RevenueEntry[];
  sources: IncomeSource[];
  showAll?: boolean;
}

const COLORS_LIST = ['#5B2EFF', '#FF4D9D', '#39FF14', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444'];

export function SourceBreakdown({ entries, sources, showAll = false }: SourceBreakdownProps) {
  const data = useMemo(() => {
    const sourceMap = sources.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>);
    const totals: Record<string, number> = {};
    
    entries.forEach(e => {
      const name = sourceMap[e.sourceId] || 'Deleted Source';
      totals[name] = (totals[name] || 0) + e.amount;
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, value: amount }))
      .sort((a, b) => b.value - a.value);
  }, [entries, sources]);

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 py-10">
        <p className="text-sm italic">No data to breakdown yet</p>
      </div>
    );
  }

  const displayData = showAll ? data : data.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_LIST[index % COLORS_LIST.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {displayData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shrink-0" 
                style={{ backgroundColor: COLORS_LIST[index % COLORS_LIST.length] }} 
              />
              <span className="text-sm text-gray-400 truncate max-w-[150px]">{item.name}</span>
            </div>
            <span className="text-sm font-bold">{formatCurrency(item.value)}</span>
          </div>
        ))}
        {!showAll && data.length > 5 && (
          <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest mt-2">
            + {data.length - 5} more sources
          </p>
        )}
      </div>
    </div>
  );
}
