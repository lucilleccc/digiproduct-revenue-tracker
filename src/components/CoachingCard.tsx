import { useEffect, useState } from 'react';
import { Sparkles, Brain, Loader2 } from 'lucide-react';
import { Card } from './Card';
iimport { RevenueEntry, IncomeSource, UserGoal } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CoachingCardProps {
  entries: RevenueEntry[];
  sources: IncomeSource[];
  goals: UserGoal;
  todayTotal: number;
}

export function CoachingCard({ entries, sources, goals, todayTotal }: CoachingCardProps) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      setLoading(true);
      const text = "AI insights are coming soon";
      setInsight(text);
      setLoading(false);
    }
    
    // We only fetch on load to avoid excessive credits usage, can be refreshed manually
    fetchInsight();
  }, [todayTotal]); // Re-fetch only if total changes significantly or on mount

  const refreshInsight = async () => {
    setLoading(true);
    const text = "AI insights are coming soon";
    setInsight(text);
    setLoading(false);
  };

  return (
    <Card className="premium-gradient border-royal-purple/20 relative overflow-hidden group">
      {/* Decorative background blur */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-royal-purple/10 rounded-full blur-3xl group-hover:bg-royal-purple/20 transition-colors duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-royal-purple/20 border border-royal-purple/30 rounded-full">
            <Brain className="w-4 h-4 text-royal-purple" />
            <span className="text-xs font-bold uppercase tracking-widest text-royal-purple">Smart Coaching</span>
          </div>
          <button 
            onClick={refreshInsight}
            disabled={loading}
            className="text-gray-500 hover:text-white transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
        </div>

        <div className="min-h-[80px] flex items-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-royal-purple rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="insight"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg leading-relaxed text-white/90 font-medium"
              >
                "{insight}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-gradient-to-r from-royal-purple via-hot-pink to-neon-green opacity-50"
            />
          </div>
  
        </div>
      </div>
    </Card>
  );
}
