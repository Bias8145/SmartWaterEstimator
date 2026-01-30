import React from 'react';
import { Copy, CheckCheck, TrendingUp, TrendingDown, Minus, Activity, Droplets, Target } from 'lucide-react';
import { CalculationResult, formatNumber } from '../utils/calculator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { translations } from '../utils/translations';

interface ResultsTableProps {
  results: CalculationResult[];
  totalDiff: number;
  precision: number;
  lang: 'id' | 'en';
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, totalDiff, precision, lang }) => {
  const t = translations[lang];
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = results
      .map((r) => `${r.hourLabel}\t${formatNumber(r.cumulative, precision)}\t${formatNumber(r.value, precision)}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (results.length === 0) return null;

  return (
    <Card className="w-full overflow-hidden bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <CardTitle className="text-slate-700 dark:text-white text-[11px] md:text-[13px] uppercase tracking-wide font-bold">
            {t.breakdown}
            </CardTitle>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-full text-[9px] font-bold uppercase tracking-wider transition-all bg-slate-50 dark:bg-[#1E1E1E] hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 h-7 px-3"
        >
          {copied ? (
            <>
              <CheckCheck className="mr-1.5 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">{t.copied}</span>
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3 w-3" />
              {t.copy}
            </>
          )}
        </button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-[#1E1E1E] text-slate-400 dark:text-zinc-500 font-bold border-b border-slate-100 dark:border-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-[9px] uppercase tracking-wider w-16">{t.time}</th>
                <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-center">{t.target_range}</th>
                <th className="px-4 py-3 text-[9px] uppercase tracking-wider">{t.reading}</th>
                <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-right">{t.usage}</th>
                <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-center w-16">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/30">
              {results.map((row) => (
                <tr key={row.id} className="group hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors">
                  
                  {/* Time */}
                  <td className="px-4 py-2.5 font-mono text-[10px] md:text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                    {row.hourLabel}
                  </td>

                  {/* Target Range (Verification) */}
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                        row.targetRange !== '-' 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600'
                    }`}>
                        {row.targetRange}
                    </span>
                  </td>

                  {/* Meter Reading */}
                  <td className="px-4 py-2.5 font-mono text-slate-800 dark:text-zinc-200 text-[11px] md:text-[12px] font-bold tracking-tight">
                    {formatNumber(row.cumulative, precision)}
                  </td>

                  {/* Usage */}
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* Intensity Bar */}
                        <div className="w-12 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                            <div 
                                className={`h-full rounded-full ${row.isPeak ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-zinc-600'}`} 
                                style={{ width: `${row.intensity}%` }}
                            />
                        </div>
                        <span className={`font-mono text-[11px] md:text-[12px] font-bold ${row.isPeak ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                            {formatNumber(row.value, precision)}
                        </span>
                    </div>
                  </td>

                  {/* Status Indicator */}
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                        {/* Trend */}
                        {row.trend === 'up' && <TrendingUp className="w-3 h-3 text-rose-500" />}
                        {row.trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-500" />}
                        {row.trend === 'stable' && <Minus className="w-3 h-3 text-slate-300 dark:text-zinc-600" />}
                        
                        {/* Dot */}
                        <div 
                            className={`w-1.5 h-1.5 rounded-full ${
                                row.status === 'peak' ? 'bg-rose-500' :
                                row.status === 'high' ? 'bg-orange-400' :
                                row.status === 'low' ? 'bg-emerald-500' :
                                'bg-slate-300 dark:bg-zinc-600'
                            }`} 
                        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-[#1E1E1E] font-bold text-slate-800 dark:text-zinc-200 border-t border-slate-200 dark:border-zinc-800/50">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-[9px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    {t.verified}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-white text-[11px] md:text-[13px] hidden md:table-cell">
                  {/* Spacer */}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-white text-[11px] md:text-[13px]">
                  {formatNumber(totalDiff, precision)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
