import React, { useState } from 'react';
import { IncomeSource } from '../types';
import { format } from 'date-fns';
import { Plus, DollarSign, Calendar, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface RevenueFormProps {
  sources: IncomeSource[];
  onSubmit: (sourceId: string, amount: number, date: string, notes?: string) => Promise<void>;
  onAddSource: (name: string) => Promise<void>;
}

export function RevenueForm({ sources, onSubmit, onAddSource }: RevenueFormProps) {
  const [sourceId, setSourceId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !amount) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(sourceId, parseFloat(amount), date, notes);
      setAmount('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSource = async () => {
    if (!newSourceName) return;
    await onAddSource(newSourceName);
    setNewSourceName('');
    setShowNewSourceInput(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Income Source</label>
            <div className="flex gap-2">
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-purple transition-all appearance-none text-white"
              >
                <option value="" className="bg-deep-charcoal">Select Source</option>
                {sources.map(s => (
                  <option key={s.id} value={s.id} className="bg-deep-charcoal">{s.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewSourceInput(!showNewSourceInput)}
                className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-all"
              >
                <Plus className="w-5 h-5 text-neon-green" />
              </button>
            </div>
            {showNewSourceInput && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="New source name"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateSource}
                  className="bg-neon-green text-black font-bold px-4 rounded-xl text-xs hover:bg-neon-green/80"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <DollarSign className="w-4 h-4" />
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-purple transition-all text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Date</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-purple transition-all text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Notes (Optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Sales details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal-purple transition-all text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full bg-gradient-to-r from-royal-purple to-hot-pink text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50",
            isSubmitting && "animate-pulse"
          )}
        >
          {isSubmitting ? "Processing..." : "Log Revenue Entry"}
        </button>
      </form>
    </div>
  );
}
