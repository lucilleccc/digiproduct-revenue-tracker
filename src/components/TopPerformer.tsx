import { useMemo } from 'react';
import { RevenueEntry, IncomeSource } from '../types';
import { formatCurrency } from '../lib/utils';
import { Trophy, TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

interface TopPerformerProps {
  entries: RevenueEntry[];
  sources: IncomeSource[];
}

export function TopPerformer({ entries, sources }: TopPerformerProps) {
  const topData = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    
    const weekEntries = entries.filter(e => {
      const date = parseISO(e.date);
      return isWithinInterval(date, { start, end });
    });

    const totals: Record<string, number> = {};
    weekEntries.forEach(e => {
      totals[e.sourceId] = (totals[e.sourceId] || 0) + e.amount;
    });

    let topSourceId = '';
    let maxAmount = 0;

    Object.entries(totals).forEach(([id, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topSourceId = id;
      }
    });

    const source = sources.find(s => s.id === topSourceId);
    return { name: source?.name || '---', amount: maxAmount };
  }, [entries, sources]);

  return (
    <Card className="flex flex-col justify-between" glow="purple">
      <div>
        <p className="text-gray-400 font-medium mb-1 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" /> Top Performer This Week
        </p>
        <h3 className="text-xl font-bold font-display text-white mt-4">
          {topData.name}
        </h3>
        <p className="text-2xl font-bold text-neon-green mt-1">
          {formatCurrency(topData.amount)}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
          Keep pushing! This is your powerhouse right now. 🔥
        </p>
      </div>
    </Card>
  );
}
