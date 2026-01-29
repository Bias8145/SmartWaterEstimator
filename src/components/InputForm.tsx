import React, { useState } from 'react';
import { Calculator, AlertCircle, RefreshCw, Building2, Home, Activity, Gauge, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { UsageProfile } from '../utils/calculator';
import { translations } from '../utils/translations';

interface InputFormProps {
  onCalculate: (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile, precision: number) => void;
  isCalculating: boolean;
  lang: 'id' | 'en';
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate, isCalculating, lang }) => {
  const t = translations[lang];
  
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [divisions, setDivisions] = useState<string>('24');
  const [profile, setProfile] = useState<UsageProfile>('residential');
  const [precision, setPrecision] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const startNum = parseFloat(start);
    const endNum = parseFloat(end);
    const divNum = parseInt(divisions);
    const hourNum = new Date().getHours();

    if (isNaN(startNum) || isNaN(endNum) || isNaN(divNum)) {
      setError(t.err_num);
      return;
    }

    if (divNum <= 0) {
      setError(t.err_dur);
      return;
    }

    if (startNum >= endNum) {
      setError(t.err_logic);
      return;
    }

    onCalculate(startNum, endNum, divNum, hourNum, profile, precision);
  };

  return (
    <Card className="w-full border shadow-none">
      <CardHeader className="pb-4 border-b dark:border-zinc-800 border-slate-100 mb-5">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
          <Calculator className="w-4 h-4" />
          {t.config}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Meter Readings */}
          <div className="space-y-3">
             <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 ml-1">
                <Gauge className="w-3 h-3" /> {t.meter_readings}
             </label>
             <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-4 text-sm font-mono text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    />
                    <span className="text-[10px] text-slate-400 ml-2">{t.start_meter}</span>
                </div>
                <div className="flex-1 space-y-1.5">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-4 text-sm font-mono text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    />
                    <span className="text-[10px] text-slate-400 ml-2">{t.end_meter}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Duration */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 ml-1">
                    <Clock className="w-3 h-3" /> {t.duration}
                </label>
                <input
                  type="number"
                  min="1"
                  max="744"
                  value={divisions}
                  onChange={(e) => setDivisions(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
            </div>

            {/* Precision */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 ml-1">
                   # {t.precision}
                </label>
                <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 p-1 bg-slate-50 dark:bg-zinc-800 h-11">
                  {[0, 1, 2].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrecision(p)}
                      className={`flex-1 rounded-xl text-[10px] font-bold transition-all ${
                        precision === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {p === 0 ? '0' : `0.${'0'.repeat(p)}`}
                    </button>
                  ))}
                </div>
            </div>
          </div>

          {/* Profile */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 ml-1">
                <Activity className="w-3 h-3" /> {t.profile}
            </label>
            <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setProfile('residential')}
                  className={`flex flex-col items-center justify-center gap-1 h-16 rounded-2xl border transition-all ${
                    profile === 'residential'
                      ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-zinc-700 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase">{t.residential}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfile('commercial')}
                  className={`flex flex-col items-center justify-center gap-1 h-16 rounded-2xl border transition-all ${
                    profile === 'commercial'
                      ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-zinc-700 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase">{t.commercial}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfile('flat')}
                  className={`flex flex-col items-center justify-center gap-1 h-16 rounded-2xl border transition-all ${
                    profile === 'flat'
                      ? 'border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-zinc-700 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase">{t.flat}</span>
                </button>
            </div>
          </div>

          {error && (
            <div className="p-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isCalculating}
            className="w-full h-12 inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t.processing}
              </>
            ) : (
              t.generate_btn
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;
