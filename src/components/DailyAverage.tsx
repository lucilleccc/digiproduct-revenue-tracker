import { Card } from './Card';
import { Target, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { endOfMonth, format, differenceInDays } from 'date-fns';

interface DailyAverageProps {
  monthlyRevenue: number;
  monthlyGoal: number;
}

export function DailyAverage({ monthlyRevenue, monthlyGoal }: DailyAverageProps) {
  const now = new Date();
  const lastDay = endOfMonth(now);
  const remainingDays = Math.max(differenceInDays(lastDay, now) + 1, 1);
  const remainingAmount = Math.max(monthlyGoal - monthlyRevenue, 0);
  const dailyAverageNeeded = remainingAmount / remainingDays;

  return (
    <Card glow="green">
      <p className="text-gray-400 font-medium mb-1 flex items-center gap-2">
        <Target className="w-4 h-4 text-neon-green" /> Daily Average Needed
      </p>
      <h3 className="text-3xl font-bold font-display text-white mt-4">
        {formatCurrency(dailyAverageNeeded)}
      </h3>
      <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
        To hit your {formatCurrency(monthlyGoal)} monthly goal
      </p>
      <div className="mt-4 flex items-center gap-2 text-neon-green text-xs font-bold">
        <TrendingUp className="w-3 h-3" /> {remainingDays} days remaining
      </div>
    </Card>
  );
}
