import React, { useState } from 'react';
import { RefreshCw, Building2, Home, Activity, Hash, Gauge, Timer, Calculator } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
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

  // Styles
  const inputClass = "w-full h-10 md:h-11 rounded-full border-0 bg-slate-100 dark:bg-[#27272a] px-5 text-[13px] md:text-[15px] font-semibold text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition-all outline-none text-center";
  
  // Consistent Icon Color (Indigo-500)
  const iconColor = "text-indigo-500";
  // Left aligned label
  const labelClass = "text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wide mt-1.5 block text-left ml-2";
  const sectionHeaderClass = "flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3";

  return (
    <Card className="w-full overflow-visible">
      <CardContent className="py-5 px-5 space-y-5">
        
        {/* Header: CONFIGURATION */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <Calculator className={`w-3.5 h-3.5 ${iconColor}`} />
            <span className="text-[11px] md:text-[12px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-widest">
                {t.config_title}
            </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section: METER READINGS */}
          <div>
              <div className={sectionHeaderClass}>
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{t.meter_section}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className={inputClass}
                    />
                    <span className={labelClass}>{t.start_meter}</span>
                </div>
                <div>
                    <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className={inputClass}
                    />
                    <span className={labelClass}>{t.end_meter}</span>
                </div>
              </div>
          </div>

          {/* Section: DURATION & PRECISION */}
          <div className="grid grid-cols-12 gap-3">
            {/* Duration - Shorter Width (5 cols) */}
            <div className="col-span-5">
                <div className={sectionHeaderClass}>
                    <Timer className="w-3.5 h-3.5" />
                    <span>{t.duration_section}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="744"
                  value={divisions}
                  onChange={(e) => setDivisions(e.target.value)}
                  className={inputClass}
                />
            </div>

            {/* Precision - Wider Width (7 cols) */}
            <div className="col-span-7">
                <div className={sectionHeaderClass}>
                    <Hash className="w-3.5 h-3.5" />
                    <span>{t.precision_section}</span>
                </div>
                <div className="flex items-center justify-center h-10 md:h-11 rounded-full bg-slate-100 dark:bg-[#27272a] p-1">
                  {[0, 1, 2].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrecision(p)}
                      className={`flex-1 h-full rounded-full text-[11px] font-bold transition-all duration-200 ${
                        precision === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
                      }`}
                    >
                      {p === 0 ? '0' : `.${'0'.repeat(p)}`}
                    </button>
                  ))}
                </div>
            </div>
          </div>

          {/* Section: USAGE PROFILE */}
          <div>
            <div className={sectionHeaderClass}>
                <Activity className="w-3.5 h-3.5" />
                <span>{t.profile_section}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setProfile('residential')}
                  className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-[1.2rem] border-0 transition-all duration-200 ${
                    profile === 'residential'
                      ? 'bg-indigo-600/10 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-[#27272a] text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Home className={`w-4 h-4 ${profile === 'residential' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wide">{t.residential}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfile('commercial')}
                  className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-[1.2rem] border-0 transition-all duration-200 ${
                    profile === 'commercial'
                      ? 'bg-indigo-600/10 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-[#27272a] text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${profile === 'commercial' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wide">{t.commercial}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfile('flat')}
                  className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-[1.2rem] border-0 transition-all duration-200 ${
                    profile === 'flat'
                      ? 'bg-indigo-600/10 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-[#27272a] text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${profile === 'flat' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wide">{t.flat}</span>
                </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-[11px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-2xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isCalculating}
            className="w-full h-12 mt-2 inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] md:text-[14px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] shadow-lg shadow-indigo-500/20"
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
