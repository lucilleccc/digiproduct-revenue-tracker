import Papa from 'papaparse';
import { Download, Upload } from 'lucide-react';
import React, { useRef } from 'react';
import { RevenueEntry, IncomeSource } from '../types';
import { format } from 'date-fns';

interface CSVToolsProps {
  entries: RevenueEntry[];
  sources: IncomeSource[];
  onImport: (data: any[]) => Promise<void>;
}

export function CSVTools({ entries, sources, onImport }: CSVToolsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const sourceMap = sources.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>);
    const csvData = entries.map(e => ({
      Date: e.date,
      Source: sourceMap[e.sourceId] || 'Unknown',
      Amount: e.amount.toFixed(2),
      Note: e.notes || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `revenue_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await onImport(results.data);
        }
      });
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
      >
        <Upload className="w-4 h-4 text-neon-green" /> Import CSV
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv" 
          onChange={handleImport} 
        />
      </button>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
      >
        <Download className="w-4 h-4 text-royal-purple" /> Export CSV
      </button>
    </div>
  );
}
