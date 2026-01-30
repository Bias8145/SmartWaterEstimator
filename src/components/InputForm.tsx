import React, { useState } from 'react';
import { RefreshCw, Building2, Home, Activity, Target, Gauge, Timer, RotateCcw, Calculator, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import { UsageProfile } from '../utils/calculator';
import { translations } from '../utils/translations';

interface InputFormProps {
  onCalculate: (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile, precision: number) => void;
  onReset: () => void;
  isCalculating: boolean;
  lang: 'id' | 'en';
  hasResults: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate, onReset, isCalculating, lang, hasResults }) => {
  const t = translations[lang];
  
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [divisions, setDivisions] = useState<string>('24');
  const [startHour, setStartHour] = useState<string>(new Date().getHours().toString());
  const [profile, setProfile] = useState<UsageProfile>('residential');
  const [precision, setPrecision] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const startNum = parseFloat(start);
    const endNum = parseFloat(end);
    const divNum = parseInt(divisions);
    const hourNum = parseInt(startHour);

    if (isNaN(startNum) || isNaN(endNum) || isNaN(divNum) || isNaN(hourNum)) {
      setError(t.err_num);
      return;
    }

    if (divNum <= 0) {
      setError(t.err_dur);
      return;
    }

    // STRICT VALIDATION: End MUST be > Start
    if (endNum < startNum) {
        setError(t.err_logic);
        return;
    }
    
    onCalculate(startNum, endNum, divNum, hourNum, profile, precision);
  };

  const handleResetClick = () => {
      setStart('');
      setEnd('');
      setDivisions('24');
      setStartHour(new Date().getHours().toString());
      setError(null);
      onReset();
  };

  // Minimalist Dark Theme Input Style
  const inputClass = "w-full h-12 md:h-14 rounded-[1rem] bg-slate-50 dark:bg-[#1E1E1E] border-0 px-4 text-[14px] md:text-[16px] font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-center shadow-inner dark:shadow-none";
  
  const labelClass = "text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide mt-2 block text-center";
  
  const sectionHeaderClass = "flex items-center gap-2 text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2.5";

  return (
    <Card className="w-full overflow-hidden relative z-10 bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800/50 shadow-sm">
      <CardContent className="py-5 px-4 md:py-6 md:px-6 space-y-5">
        
        {/* Header Configuration */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800/50">
            <Calculator className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                {t.config_title}
            </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Section 1: Meter Readings */}
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

          {/* Section 2: Configuration (Compact Grid) */}
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            
            {/* Duration */}
            <div className="col-span-6 md:col-span-3">
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

            {/* Start Hour */}
            <div className="col-span-6 md:col-span-3">
                <div className={sectionHeaderClass}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.start_hour_section}</span>
                </div>
                <input
                type="number"
                min="0"
                max="23"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className={inputClass}
                />
            </div>

            {/* Precision */}
            <div className="col-span-12 md:col-span-6">
                <div className={sectionHeaderClass}>
                    <Target className="w-3.5 h-3.5" /> 
                    <span>{t.precision_section}</span>
                </div>
                <div className="relative flex items-center justify-center h-12 md:h-14 rounded-[1rem] bg-slate-50 dark:bg-[#1E1E1E] p-1.5 isolate">
                {[0, 1, 2].map((p) => (
                    <button
                    key={p}
                    type="button"
                    onClick={() => setPrecision(p)}
                    className={`relative z-10 flex-1 h-full rounded-[0.8rem] text-[12px] font-bold transition-colors duration-200 ${
                        precision === p
                        ? 'text-white'
                        : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
                    }`}
                    >
                    {precision === p && (
                        <motion.div
                        layoutId="activePrecision"
                        className="absolute inset-0 bg-indigo-500 dark:bg-indigo-600 rounded-[0.8rem] shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ zIndex: -1 }}
                        />
                    )}
                    {p === 0 ? '0' : `.${'0'.repeat(p)}`}
                    </button>
                ))}
                </div>
            </div>
          </div>

          {/* Section 3: Profile */}
          <div>
                <div className={sectionHeaderClass}>
                    <Activity className="w-3.5 h-3.5" />
                    <span>{t.profile_section}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[
                    { id: 'residential', icon: Home, label: t.residential },
                    { id: 'commercial', icon: Building2, label: t.commercial },
                    { id: 'flat', icon: Activity, label: t.flat }
                    ].map((item) => (
                    <motion.button
                        key={item.id}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setProfile(item.id as UsageProfile)}
                        className={`flex flex-col items-center justify-center gap-1.5 h-14 md:h-16 rounded-[1rem] border transition-all duration-200 ${
                        profile === item.id
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-50 dark:bg-[#1E1E1E] border-transparent text-slate-400 dark:text-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
                    </motion.button>
                    ))}
                </div>
            </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 flex items-center justify-center gap-2 text-[11px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-2xl text-center border border-red-100 dark:border-red-900/20"
            >
              <AlertTriangle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div className="flex gap-2 pt-1">
            <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={isCalculating}
                className="flex-1 h-12 md:h-14 inline-flex items-center justify-center rounded-[1.2rem] bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold tracking-wide transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-indigo-500/20"
            >
                {isCalculating ? (
                <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t.processing}
                </>
                ) : (
                t.generate_btn
                )}
            </motion.button>

            {hasResults && (
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetClick}
                    className="h-12 w-12 md:h-14 md:w-14 inline-flex items-center justify-center rounded-[1.2rem] bg-slate-100 dark:bg-[#1E1E1E] text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                    title={t.reset_btn}
                >
                    <RotateCcw className="h-5 w-5" />
                </motion.button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;
