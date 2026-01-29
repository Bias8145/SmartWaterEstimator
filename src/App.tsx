import React, { useState, useEffect } from 'react';
import { Droplets, Moon, Sun, Languages } from 'lucide-react';
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
  
  // Settings
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'id' | 'en'>('id');

  const t = translations[lang];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleCalculate = (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile, prec: number) => {
    setIsCalculating(true);
    setResults([]);
    setPrecision(prec);
    
    setTimeout(() => {
      const calculatedResults = distributeValue(start, end, divisions, startHour, profile, prec);
      setResults(calculatedResults);
      setTotalDiff(end - start);
      setIsCalculating(false);
    }, 500);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'id' ? 'en' : 'id');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      {/* Compact Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Droplets className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                Smart<span className="text-indigo-600 dark:text-indigo-400">Estimator</span>
              </span>
           </div>

           <div className="flex items-center gap-2">
              <button 
                onClick={toggleLang}
                className="h-8 px-2.5 rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold uppercase transition-colors"
              >
                {lang}
              </button>
              <button 
                onClick={toggleTheme}
                className="h-8 w-8 flex items-center justify-center rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
           </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        
        {/* Intro */}
        <div className="mb-6">
           <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {t.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t.desc}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          
          <InputForm onCalculate={handleCalculate} isCalculating={isCalculating} lang={lang} />

          {results.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <AnalysisChart results={results} precision={precision} lang={lang} theme={theme} />
              <ResultsTable results={results} totalDiff={totalDiff} precision={precision} lang={lang} />
            </div>
          )}
          
          {results.length === 0 && !isCalculating && (
            <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              <div className="bg-slate-100 dark:bg-zinc-800 p-3 rounded-full mb-3">
                <Droplets className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                {lang === 'id' ? 'Siap untuk analisis data.' : 'Ready to analyze data.'}
              </p>
            </div>
          )}

        </div>

        <footer className="mt-12 text-center border-t border-slate-200 dark:border-zinc-800 pt-6">
          <p className="text-[10px] text-slate-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Smart Water Analytics.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
