import { useMemo, useState } from 'react';
import { useRevenue } from './hooks/useRevenue';
import { signIn, signOut } from './lib/firebase';
import { DashboardStats } from './components/DashboardStats';
import { CoachingCard } from './components/CoachingCard';
import { RevenueForm } from './components/RevenueForm';
import { TrendsChart } from './components/TrendsChart';
import { SourceBreakdown } from './components/SourceBreakdown';
import { Card } from './components/Card';
import { CSVTools } from './components/CSVTools';
import { TopPerformer } from './components/TopPerformer';
import { DailyAverage } from './components/DailyAverage';
import { EditRevenueModal } from './components/EditRevenueModal';
import { format, isSameDay, startOfMonth, parseISO, isWithinInterval, endOfMonth } from 'date-fns';
import { 
  LogOut, 
  Plus, 
  BarChart3, 
  PieChart, 
  Sparkles, 
  LayoutDashboard,
  Wallet,
  Settings,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from './lib/utils';
import { DEFAULT_DAILY_TARGET, DEFAULT_MONTHLY_TARGET } from './constants';
import { RevenueEntry } from './types';

export default function App() {
  const { sources, entries, goals, loading, user, addRevenue, addSource, updateGoal, importCSV, deleteRevenue, updateRevenue } = useRevenue();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trends' | 'history' | 'settings'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RevenueEntry | null>(null);

  const stats = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const todayTotal = entries.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
    const yesterdayTotal = entries.filter(e => e.date === yesterdayStr).reduce((sum, e) => sum + e.amount, 0);
    const monthTotal = entries
      .filter(e => {
        const date = parseISO(e.date);
        return isWithinInterval(date, { start: startOfCurrentMonth, end: endOfCurrentMonth });
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      todayTotal,
      yesterdayTotal,
      monthTotal,
      todayEntries: entries.filter(e => e.date === todayStr)
    };
  }, [entries]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-deep-charcoal">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-royal-purple border-t-neon-green rounded-full"
        />
        <p className="mt-4 text-gray-400 font-medium tracking-widest animate-pulse uppercase">Command Center Initializing...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-deep-charcoal p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#5B2EFF10,transparent_70%)]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-10 text-center relative z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-royal-purple via-hot-pink to-neon-green rounded-3xl mx-auto mb-8 flex items-center justify-center rotate-12 shadow-[0_0_30px_rgba(91,46,255,0.4)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/20" />
            <TrendingUp className="w-10 h-10 text-white -rotate-12 relative z-10" />
          </div>
          <h1 className="text-4xl font-bold font-display mb-4 tracking-tight">DigiProduct Tracker</h1>
          <p className="text-gray-400 mb-10 leading-relaxed text-sm">
            Log. Track. Analyze. Grow. Hit your goals everyday.
          </p>
          <button
            onClick={signIn}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neon-green hover:text-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-charcoal flex">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "border-r border-white/5 bg-[#0a0f1d] hidden lg:flex flex-col sticky top-0 h-screen p-6 transition-all duration-300 overflow-y-auto",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}>
        <div className="flex items-center justify-between mb-10">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-gradient-to-tr from-royal-purple to-neon-green rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold font-display text-lg tracking-tight whitespace-nowrap">DigiProduct</h1>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 hover:bg-white/5 rounded transition-colors text-gray-500"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} collapsed={isSidebarCollapsed}>Dashboard</SidebarLink>
          <SidebarLink active={false} onClick={() => setShowAddModal(true)} icon={<Plus size={20} />} accent collapsed={isSidebarCollapsed}>Log Revenue</SidebarLink>
          <SidebarLink active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<BarChart3 size={20} />} collapsed={isSidebarCollapsed}>Trends</SidebarLink>
          <SidebarLink active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Calendar size={20} />} collapsed={isSidebarCollapsed}>History</SidebarLink>
          <SidebarLink active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} collapsed={isSidebarCollapsed}>Settings</SidebarLink>
        </nav>

        {!isSidebarCollapsed && (
          <div className="mt-auto">
            <Card className="premium-gradient p-4 border-none" glow="purple">
              <p className="text-xs font-bold text-white mb-2">You've got this! 🏆</p>
              <p className="text-[10px] text-gray-400 mb-4 font-medium leading-relaxed">Every dollar brings you closer to freedom.</p>
              <div className="text-hot-pink flex justify-center"><Plus size={16} className="rotate-45" /></div>
            </Card>
          </div>
        )}
        
        <button 
          onClick={signOut}
          className={cn(
            "w-full mt-6 flex items-center gap-3 py-3 text-gray-500 hover:text-hot-pink transition-all text-sm font-medium",
            isSidebarCollapsed ? "justify-center" : "px-4"
          )}
        >
          <LogOut size={18} /> {!isSidebarCollapsed && "Sign Out"}
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-10 sticky top-0 bg-deep-charcoal/80 backdrop-blur-xl z-40">
          <div>
            <h2 className="text-xl font-bold font-display">Good morning, {user.displayName?.split(' ')[0]}! 👋</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Performance Command Center</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
               <Calendar className="w-4 h-4 text-gray-400" />
               <span className="text-xs font-medium">{format(new Date(), 'MMM dd')}</span>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-royal-purple text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-royal-purple/80 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> Log Revenue
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
           <AnimatePresence mode="wait">
             {activeTab === 'dashboard' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  <DashboardStats 
                    todayRevenue={stats.todayTotal}
                    dailyGoal={goals?.dailyTarget || 300}
                    monthlyRevenue={stats.monthTotal}
                    monthlyGoal={goals?.monthlyTarget || 10000}
                    yesterdayRevenue={stats.yesterdayTotal}
                  />

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <Card className="xl:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold flex items-center gap-2 text-gray-300">
                          <PieChart size={18} className="text-royal-purple" />
                          Revenue by Income Source (Today)
                        </h3>
                      </div>
                      <SourceBreakdown entries={stats.todayEntries} sources={sources} showAll />
                    </Card>

                    {goals && (
                      <CoachingCard 
                        entries={entries} 
                        sources={sources} 
                        goals={goals} 
                        todayTotal={stats.todayTotal} 
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card glow="green">
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Today vs Yesterday</p>
                       <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg", stats.todayTotal >= stats.yesterdayTotal ? "bg-neon-green/10 text-neon-green" : "bg-hot-pink/10 text-hot-pink")}>
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold font-display">
                              {stats.yesterdayTotal === 0 ? "---" : `${(((stats.todayTotal - stats.yesterdayTotal) / stats.yesterdayTotal) * 100).toFixed(0)}%`}
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">vs yesterday</p>
                          </div>
                       </div>
                    </Card>

                    <Card>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">This Month So Far</p>
                       <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-royal-purple/10 text-royal-purple">
                            <Wallet size={20} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold font-display">{formatCurrency(stats.monthTotal)}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">of {formatCurrency(goals?.monthlyTarget || 10000)} goal</p>
                          </div>
                       </div>
                       <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-royal-purple" 
                            style={{ width: `${Math.min((stats.monthTotal / (goals?.monthlyTarget || 10000)) * 100, 100)}%` }} 
                          />
                       </div>
                    </Card>

                    <DailyAverage monthlyRevenue={stats.monthTotal} monthlyGoal={goals?.monthlyTarget || 10000} />
                    <TopPerformer entries={entries} sources={sources} />
                  </div>

                  <Card>
                    <div className="mb-6">
                      <h3 className="font-bold flex items-center gap-2 text-gray-300">
                        <BarChart3 size={18} className="text-neon-green" />
                        Daily Revenue Trend (Last 7 Days)
                      </h3>
                    </div>
                    <TrendsChart entries={entries} />
                  </Card>
               </motion.div>
             )}

             {activeTab === 'trends' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                 <Card>
                   <h3 className="text-xl font-bold font-display mb-6">Advanced Analytics</h3>
                   <TrendsChart entries={entries} />
                 </Card>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                      <h3 className="text-lg font-bold mb-6">Monthly Stream Performance</h3>
                      <SourceBreakdown entries={entries.filter(e => {
                        const date = parseISO(e.date);
                        return isWithinInterval(date, { start: startOfMonth(new Date()), end: new Date() });
                      })} sources={sources} />
                    </Card>
                    {goals && (
                      <CoachingCard 
                        entries={entries} 
                        sources={sources} 
                        goals={goals} 
                        todayTotal={stats.todayTotal} 
                      />
                    )}
                 </div>
               </motion.div>
             )}

             {activeTab === 'history' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold font-display">Revenue History</h3>
                      <p className="text-gray-400 text-sm">Full log of your digital product sales</p>
                    </div>
                    <CSVTools entries={entries} sources={sources} onImport={importCSV} />
                 </div>
                 
                 <Card className="p-0 overflow-hidden border-white/5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/5 uppercase text-[10px] tracking-widest text-gray-400 font-black">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Notes</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {entries.map(e => {
                            const source = sources.find(s => s.id === e.sourceId);
                            return (
                              <tr key={e.id} className="hover:bg-white/5 transition-colors cursor-default group">
                                <td className="px-6 py-4 text-sm font-medium text-gray-300">{format(parseISO(e.date), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 bg-royal-purple/10 text-royal-purple rounded-full text-[10px] font-black uppercase tracking-tight">
                                    {source?.name}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-neon-green">{formatCurrency(e.amount)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{e.notes || '---'}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                      onClick={() => setEditingEntry(e)}
                                      className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-royal-purple hover:bg-royal-purple/10 transition-all font-medium text-xs"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (confirm('Delete this entry?')) deleteRevenue(e.id);
                                      }}
                                      className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-hot-pink hover:bg-hot-pink/10 transition-all font-medium text-xs"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {entries.length === 0 && (
                        <div className="py-20 text-center text-gray-500 italic">No logs found. Use the + button to get started.</div>
                      )}
                    </div>
                 </Card>
               </motion.div>
             )}

             {activeTab === 'settings' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
                  <Card>
                    <h3 className="text-xl font-bold font-display mb-6">System Preferences</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Daily Target</label>
                           <input 
                            type="number"
                            value={goals?.dailyTarget || 0}
                            onChange={(e) => updateGoal(parseFloat(e.target.value), goals?.monthlyTarget || 10000)}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold font-display text-neon-green"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Target</label>
                           <input 
                            type="number"
                            value={goals?.monthlyTarget || 0}
                            onChange={(e) => updateGoal(goals?.dailyTarget || 300, parseFloat(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold font-display text-hot-pink"
                           />
                        </div>
                      </div>
                    </div>
                  </Card>
               </motion.div>
             )}
           </AnimatePresence>
        </main>
        
        {/* Quote Footer */}
        <div className="mt-auto py-6 px-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500">
            <p className="text-[10px] font-bold uppercase flex items-center gap-2">
               <Sparkles size={12} className="text-neon-green" /> Small daily actions = Massive monthly results.
            </p>
            <p className="text-[10px] font-bold uppercase italic text-hot-pink">You've got this! ♡</p>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl z-50 shadow-2xl">
        <MobileNavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} />
        <MobileNavBtn active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} icon={<BarChart3 size={20} />} />
        <button onClick={() => setShowAddModal(true)} className="w-12 h-12 bg-royal-purple text-white rounded-xl flex items-center justify-center shadow-lg"><Plus /></button>
        <MobileNavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Calendar size={20} />} />
        <MobileNavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} />
      </nav>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setShowAddModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative z-10 w-full max-w-lg glass-card p-8 border-royal-purple/20"
             >
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-2xl font-bold font-display">New Revenue Log</h3>
                   <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors">
                     <Plus size={24} className="rotate-45" />
                   </button>
                </div>
                <RevenueForm sources={sources} onSubmit={async (s, a, d, n) => {
                  await addRevenue(s, a, d, n);
                  setShowAddModal(false);
                }} onAddSource={async (name) => { await addSource(name); }} />
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <EditRevenueModal 
            entry={editingEntry}
            sources={sources}
            onClose={() => setEditingEntry(null)}
            onUpdate={updateRevenue}
            onDelete={deleteRevenue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, children, accent = false, collapsed = false }: { active: boolean, onClick: () => void, icon: any, children: any, accent?: boolean, collapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 py-3 rounded-xl transition-all text-sm font-bold group",
        collapsed ? "justify-center" : "px-4",
        active 
          ? "bg-royal-purple text-white shadow-lg shadow-royal-purple/20" 
          : accent 
            ? "text-neon-green hover:bg-neon-green/10" 
            : "text-gray-500 hover:bg-white/5 hover:text-white"
      )}
    >
      <span className={cn(active ? "text-white" : accent ? "text-neon-green" : "text-gray-500 group-hover:text-white")}>{icon}</span>
      {!collapsed && children}
    </button>
  );
}

function MobileNavBtn({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: any }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl transition-all",
        active ? "bg-white/10 text-royal-purple" : "text-gray-500"
      )}
    >
      {icon}
    </button>
  );
}

