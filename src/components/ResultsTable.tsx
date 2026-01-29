import React from 'react';
import { Copy, CheckCheck, Table2, TrendingUp, TrendingDown, Droplets, Gauge } from 'lucide-react';
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
    <Card className="w-full border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b dark:border-zinc-800 border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          <Table2 className="w-4 h-4" />
          {t.breakdown}
        </CardTitle>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 h-8 px-4"
        >
          {copied ? (
            <>
              <CheckCheck className="mr-1.5 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">{t.copied}</span>
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
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-500 font-semibold border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 w-24">{t.time}</th>
                <th className="px-6 py-4">
                   <div className="flex items-center gap-1.5">
                      <Gauge className="w-3 h-3 text-slate-400" />
                      {t.reading}
                   </div>
                </th>
                <th className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-1.5">
                      {t.usage}
                      <Droplets className="w-3 h-3 text-indigo-400" />
                   </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
              {results.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-6 py-3 font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                    {String(row.id).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-3 font-mono text-slate-600 dark:text-zinc-300">
                    {formatNumber(row.cumulative, precision)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-mono font-bold ${row.isPeak ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {formatNumber(row.value, precision)}
                      </span>
                      {row.isPeak && (
                        <TrendingUp className="w-3 h-3 text-red-400" />
                      )}
                      {!row.isPeak && row.value < (totalDiff / results.length) * 0.5 && (
                         <TrendingDown className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-zinc-800/50 font-bold text-slate-900 dark:text-zinc-100 border-t border-slate-200 dark:border-zinc-800">
              <tr>
                <td className="px-6 py-4 text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total</td>
                <td className="px-6 py-4 text-xs text-slate-400 dark:text-zinc-500 font-normal">
                  {t.verified}
                </td>
                <td className="px-6 py-4 text-right font-mono text-indigo-600 dark:text-indigo-400">
                  {formatNumber(totalDiff, precision)} m³
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
