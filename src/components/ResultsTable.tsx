import React from 'react';
import { Copy, CheckCheck, TrendingUp } from 'lucide-react';
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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-slate-500 dark:text-zinc-500 text-[11px] md:text-[13px] uppercase tracking-wide">
          {t.breakdown}
        </CardTitle>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-full text-[9px] md:text-[11px] font-bold uppercase tracking-wider transition-all bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 h-7 px-3"
        >
          {copied ? (
            <>
              <CheckCheck className="mr-1 h-2.5 w-2.5 text-emerald-500" />
              <span className="text-emerald-500">{t.copied}</span>
            </>
          ) : (
            <>
              <Copy className="mr-1 h-2.5 w-2.5" />
              {t.copy}
            </>
          )}
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-zinc-800/30 text-slate-400 dark:text-zinc-500 font-semibold">
              <tr>
                <th className="px-5 py-3 w-28 text-[10px] md:text-[12px] uppercase tracking-wide">{t.time}</th>
                <th className="px-5 py-3 text-center hidden sm:table-cell text-[10px] md:text-[12px] uppercase tracking-wide">
                   Range
                </th>
                <th className="px-5 py-3 text-[10px] md:text-[12px] uppercase tracking-wide">
                   {t.reading}
                </th>
                <th className="px-5 py-3 text-right text-[10px] md:text-[12px] uppercase tracking-wide">
                   {t.usage}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {results.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-2.5 font-mono text-[10px] md:text-[12px] text-slate-500 dark:text-zinc-400">
                    {row.hourLabel}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[10px] md:text-[12px] text-center text-slate-400 dark:text-zinc-600 hidden sm:table-cell">
                    {row.targetRange}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-slate-600 dark:text-zinc-300 text-[10px] md:text-[12px]">
                    {formatNumber(row.cumulative, precision)}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`font-mono text-[10px] md:text-[12px] font-bold ${row.isPeak ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-zinc-300'}`}>
                        {formatNumber(row.value, precision)}
                      </span>
                      {row.isPeak && (
                        <TrendingUp className="w-2.5 h-2.5 text-indigo-400" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-zinc-800/30 font-bold text-slate-800 dark:text-zinc-200">
              <tr>
                <td className="px-5 py-3 text-[9px] md:text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total</td>
                <td className="hidden sm:table-cell"></td>
                <td className="px-5 py-3 text-[9px] md:text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                  {t.verified}
                </td>
                <td className="px-5 py-3 text-right font-mono text-indigo-600 dark:text-indigo-400 text-[11px] md:text-[13px]">
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
