import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, X } from 'lucide-react';
import { RevenueEntry, IncomeSource } from '../types';

interface EditRevenueModalProps {
  entry: RevenueEntry;
  sources: IncomeSource[];
  onClose: () => void;
  onUpdate: (id: string, data: Partial<RevenueEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EditRevenueModal({ entry, sources, onClose, onUpdate, onDelete }: EditRevenueModalProps) {
  const [amount, setAmount] = useState(entry.amount.toString());
  const [sourceId, setSourceId] = useState(entry.sourceId);
  const [date, setDate] = useState(entry.date);
  const [notes, setNotes] = useState(entry.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(entry.id, {
      amount: parseFloat(amount),
      sourceId,
      date,
      notes
    });
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this log?')) {
      await onDelete(entry.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-lg glass-card p-8 border-royal-purple/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold font-display">Edit Revenue Log</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount (USD)</label>
            <input 
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold font-display text-neon-green"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Income Source</label>
            <select 
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white appearance-none"
            >
              {sources.map(s => <option key={s.id} value={s.id} className="bg-deep-charcoal text-white">{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date</label>
            <input 
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white resize-none"
              rows={2}
              placeholder="Add details..."
            />
          </div>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={handleDelete}
              className="bg-hot-pink/10 text-hot-pink border border-hot-pink/20 px-6 py-4 rounded-xl font-bold hover:bg-hot-pink/20 transition-all uppercase text-xs tracking-widest"
            >
              Delete
            </button>
            <button 
              type="submit"
              className="bg-royal-purple text-white px-6 py-4 rounded-xl font-bold hover:bg-royal-purple/80 transition-all uppercase text-xs tracking-widest"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
