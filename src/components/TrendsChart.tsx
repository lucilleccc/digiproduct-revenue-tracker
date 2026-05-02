import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { RevenueEntry } from '../types';

interface TrendsChartProps {
  entries: RevenueEntry[];
}

export function TrendsChart({ entries }: TrendsChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        displayDate: format(date, 'MMM d'),
        amount: 0
      };
    });

    entries.forEach(entry => {
      const dayData = last7Days.find(d => d.date === entry.date);
      if (dayData) {
        dayData.amount += entry.amount;
      }
    });

    return last7Days;
  }, [entries]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B2EFF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#5B2EFF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e1b4b', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#39FF14' }}
            cursor={{ stroke: '#5B2EFF', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#5B2EFF" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
