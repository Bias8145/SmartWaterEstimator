import React from 'react';
import { Copy, CheckCheck, Table2, TrendingUp, TrendingDown, Droplets, Gauge } from 'lucide-react';
import { CalculationResult, formatNumber } from '../utils/calculator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ResultsTableProps {
  results: CalculationResult[];
  totalDiff: number;
  precision: number;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, totalDiff, precision }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Copy format: Time | Usage | Meter Reading
    const text = results
      .map((r) => `${r.hourLabel}\t${formatNumber(r.value, precision)}\t${formatNumber(r.cumulative, precision)}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (results.length === 0) return null;

  return (
    <Card className="w-full border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
          <Table2 className="w-6 h-6 text-indigo-500" />
          Detailed Breakdown
        </CardTitle>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-50 hover:text-indigo-600 h-10 px-4 shadow-sm"
        >
          {copied ? (
            <>
              <CheckCheck className="mr-2 h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Data
            </>
          )}
        </button>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 w-32">Time</th>
                  <th className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-indigo-400" />
                        Usage (m³)
                     </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        Meter Reading
                        <Gauge className="w-4 h-4 text-slate-400" />
                     </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-500 flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-mono">
                        {row.hourLabel}
                      </span>
                    </td>
                    
                    {/* USAGE COLUMN (LEFT) */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-base ${row.isPeak ? 'text-indigo-600' : 'text-slate-700'}`}>
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

                    {/* METER READING COLUMN (RIGHT) */}
                    <td className="px-6 py-3 text-right font-mono text-slate-600 group-hover:text-slate-900">
                      {formatNumber(row.cumulative, precision)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 sticky bottom-0 z-10">
                <tr>
                  <td className="px-6 py-4">Total</td>
                  <td className="px-6 py-4 font-mono text-indigo-700 text-lg">
                    {formatNumber(totalDiff, precision)} m³
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400 text-xs font-normal">
                    Verified
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
