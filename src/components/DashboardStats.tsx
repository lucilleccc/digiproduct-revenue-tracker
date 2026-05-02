import { useMemo } from 'react';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, TrendingDown, Target, Wallet, Calendar, Sparkles } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface StatsProps {
  todayRevenue: number;
  dailyGoal: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  yesterdayRevenue: number;
}

export function DashboardStats({ 
  todayRevenue, 
  dailyGoal, 
  monthlyRevenue, 
  monthlyGoal,
  yesterdayRevenue
}: StatsProps) {
  const percentReached = Math.min((todayRevenue / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - todayRevenue, 0);
  
  const diffYesterday = yesterdayRevenue === 0 
    ? (todayRevenue > 0 ? 100 : 0) 
    : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

  const isUp = diffYesterday >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Main Metric */}
      <Card glow={percentReached >= 100 ? 'green' : 'purple'} className="lg:col-span-2 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 font-medium mb-1 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Today's Revenue
            </p>
            <h2 className="text-5xl md:text-7xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {formatCurrency(todayRevenue)}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Progress to Goal</p>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 251 }}
                  animate={{ strokeDashoffset: 251 - (251 * percentReached) / 100 }}
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={percentReached >= 100 ? '#39FF14' : '#5B2EFF'}
                  strokeWidth="8"
                  strokeDasharray="251"
                  fill="transparent"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  "text-lg font-bold",
                  percentReached >= 100 ? "text-neon-green" : "text-white"
                )}>
                  {Math.round(percentReached)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Remaining to Daily Goal</p>
            <p className={cn(
              "text-2xl font-bold font-display",
              remaining === 0 ? "text-neon-green" : "text-hot-pink"
            )}>
              {remaining === 0 ? "GOAL REACHED!" : formatCurrency(remaining)}
            </p>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm",
            isUp ? "bg-neon-green/10 text-neon-green" : "bg-hot-pink/10 text-hot-pink"
          )}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(diffYesterday).toFixed(1)}% vs yesterday
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-sm font-medium">
            {todayRevenue >= dailyGoal ? (
              <span className="text-neon-green flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Goal achieved. Everything above this is momentum.
              </span>
            ) : percentReached >= 80 ? (
              <span className="text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-royal-purple" /> You're almost there. One more push.
              </span>
            ) : (
              <span className="text-gray-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-hot-pink" /> You're {formatCurrency(remaining)} away from your {formatCurrency(dailyGoal)} goal. Let’s close the gap.
              </span>
            )}
          </p>
        </div>
      </Card>

      {/* Monthly Overview */}
      <Card className="flex flex-col justify-between" glow="pink">
        <div>
          <p className="text-gray-400 font-medium mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Monthly Total
          </p>
          <h3 className="text-4xl font-bold font-display text-white">
            {formatCurrency(monthlyRevenue)}
          </h3>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Target: {formatCurrency(monthlyGoal)}</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((monthlyRevenue / monthlyGoal) * 100, 100)}%` }}
              className="h-full bg-hot-pink glow-pink"
            />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="text-lg font-bold text-white">{formatCurrency(Math.max(monthlyGoal - monthlyRevenue, 0))}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neon-green font-bold flex items-center gap-1 justify-end">
                <Target className="w-3 h-3" /> Growth State
              </p>
              <p className="text-xs text-gray-500">Momentum Building</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
