import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock } from 'lucide-react';
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
  
  // Settings - Default to DARK
  const [theme, setTheme] = useState<'dark' | 'light'>('dark'); 
  const [lang, setLang] = useState<'id' | 'en'>('id');
  
  // Real-time Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  const t = translations[lang];

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCalculate = (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile, prec: number) => {
    setIsCalculating(true);
    setResults([]);
    setPrecision(prec);
    
    setTimeout(() => {
      const calculatedResults = distributeValue(start, end, divisions, startHour, profile, prec);
      setResults(calculatedResults);
      setTotalDiff(end - start);
      setIsCalculating(false);
    }, 500); // Slight delay to feel like "processing"
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'id' ? 'en' : 'id');

  // Date Formatting
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
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#09090b] text-slate-600 dark:text-zinc-400 font-sans transition-colors duration-300 pb-8 text-[12px] md:text-[16px]">
      
      {/* Floating Compact Header - Solid Colors, No Blur/Glow */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <header className="pointer-events-auto bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-full pl-6 pr-2 py-2.5 flex items-center gap-4 max-w-xl w-full justify-between transition-all duration-300 shadow-sm">
           
           {/* Logotype Only - No Icon */}
           <div className="flex items-center">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-slate-800 dark:text-zinc-100">
                Smart<span className="text-indigo-600 dark:text-indigo-500">Estimator</span>
              </h1>
           </div>

           {/* Controls */}
           <div className="flex items-center gap-1">
              <button 
                onClick={toggleLang}
                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 text-[10px] font-bold uppercase transition-all active:scale-95 text-slate-600 dark:text-zinc-400"
              >
                {lang}
              </button>
              <button 
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95 text-slate-600 dark:text-zinc-400"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
           </div>
        </header>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-24 md:pt-28">
        
        {/* Title Section - NO PANEL, Plain Text */}
        <div className="mb-6 text-center space-y-3">
             <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.title}
                </h2>
                <p className="text-[11px] md:text-[13px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed font-medium">
                  {t.desc}
                </p>
             </div>

             {/* Real-time Clock - INSIDE A PANEL/PILL */}
             <div className="inline-flex items-center gap-3 bg-white dark:bg-[#18181b] px-5 py-2.5 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm mt-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-medium text-[11px] md:text-[12px] text-slate-600 dark:text-zinc-300">
                  {formatDate(currentTime)}
                </span>
                <div className="w-px h-3 bg-slate-200 dark:bg-zinc-700"></div>
                <span className="font-bold font-mono text-[11px] md:text-[12px] text-slate-800 dark:text-zinc-100 tabular-nums">
                  {formatTime(currentTime)}
                </span>
             </div>
        </div>

        <div className="flex flex-col gap-4">
          
          <InputForm onCalculate={handleCalculate} isCalculating={isCalculating} lang={lang} />

          {results.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              <AnalysisChart results={results} precision={precision} lang={lang} theme={theme} />
              <ResultsTable results={results} totalDiff={totalDiff} precision={precision} lang={lang} />
            </div>
          )}
          
        </div>

        <footer className="mt-12 mb-6 text-center">
          <p className="text-[9px] text-slate-400 dark:text-zinc-700 font-bold tracking-widest uppercase">
            Smart Water Analytics &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
