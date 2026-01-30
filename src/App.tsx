import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from './components/InputForm';
import ResultsTable from './components/ResultsTable';
import AnalysisChart from './components/AnalysisChart';
import { distributeValue, CalculationResult, UsageProfile } from './utils/calculator';
import { translations } from './utils/translations';

function App() {
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [totalDiff, setTotalDiff] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [precision, setPrecision] = useState<number>(1);
  const [calcError, setCalcError] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [currentTime, setCurrentTime] = useState(new Date());

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCalculate = (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile, prec: number) => {
    setIsCalculating(true);
    setResults([]);
    setCalcError(null);
    setPrecision(prec);
    
    setTimeout(() => {
      try {
        const calculatedResults = distributeValue(start, end, divisions, startHour, profile, prec);
        
        if (calculatedResults.length === 0) {
           setCalcError(t.err_calc);
        } else {
           setResults(calculatedResults);
           setTotalDiff(Math.abs(end - start));
        }
      } catch (error) {
        console.error("Calculation Error:", error);
        setCalcError(t.err_calc);
      } finally {
        setIsCalculating(false);
      }
    }, 400); 
  };

  const handleReset = () => {
    setResults([]);
    setTotalDiff(0);
    setCalcError(null);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'id' ? 'en' : 'id');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace(/:/g, '.');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-600 dark:text-zinc-400 font-sans transition-colors duration-300 pb-8 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      
      {/* Floating Header - Compact & Aesthetic */}
      <div className="fixed top-3 md:top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-3">
        <div className="pointer-events-auto max-w-lg w-full bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 rounded-full pl-6 pr-2 py-2.5 shadow-sm transition-all duration-300 flex items-center justify-between">
            
            {/* Brand */}
            <div className="flex flex-col justify-center">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
                    Smart<span className="text-indigo-500">Estimator</span>
                </h1>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={toggleLang}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 text-[10px] font-bold uppercase transition-all active:scale-95 text-slate-500 dark:text-zinc-400"
                >
                    {lang}
                </button>
                <button 
                    onClick={toggleTheme}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95 text-slate-500 dark:text-zinc-400"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-3 pt-20 md:pt-28">
        
        {/* Title Section */}
        <div className="text-center space-y-2 mb-5">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {t.title}
            </h2>
            <p className="text-[10px] md:text-[13px] text-slate-500 dark:text-zinc-500 leading-relaxed font-medium max-w-xs mx-auto">
                {t.desc}
            </p>
        </div>

        {/* Clock Panel - Compact Pill */}
        <div className="flex justify-center mb-5">
            <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800/50 rounded-full px-5 py-2 shadow-sm flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] md:text-[12px] font-medium text-slate-600 dark:text-zinc-400">
                    {formatDate(currentTime)}
                </span>
                <div className="w-px h-3 bg-slate-200 dark:bg-zinc-800"></div>
                <span className="text-[11px] md:text-[12px] font-bold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formatTime(currentTime)}
                </span>
            </div>
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          
          <InputForm 
            onCalculate={handleCalculate} 
            onReset={handleReset}
            isCalculating={isCalculating} 
            lang={lang} 
            hasResults={results.length > 0}
          />

          {calcError && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center rounded-2xl text-[11px] font-bold border border-red-100 dark:border-red-900/30"
              >
                  {calcError}
              </motion.div>
          )}

          <AnimatePresence>
            {results.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-3 md:space-y-4"
                >
                <ResultsTable 
                    results={results} 
                    totalDiff={totalDiff} 
                    precision={precision} 
                    lang={lang} 
                />
                <AnalysisChart results={results} precision={precision} lang={lang} theme={theme} />
                </motion.div>
            )}
          </AnimatePresence>
          
        </div>

        <footer className="mt-8 mb-4 text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[9px] text-slate-400 dark:text-zinc-600 font-bold tracking-widest uppercase">
            Smart Water Analytics &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
