import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
import InputForm from './components/InputForm';
import ResultsTable from './components/ResultsTable';
import AnalysisChart from './components/AnalysisChart';
import { distributeValue, CalculationResult, UsageProfile } from './utils/calculator';

function App() {
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [totalDiff, setTotalDiff] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [precision, setPrecision] = useState<number>(1);

  const handleCalculate = (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile, prec: number) => {
    setIsCalculating(true);
    setResults([]); // Clear previous results to trigger animation
    setPrecision(prec);
    
    // Simulate "Smart Processing" time
    setTimeout(() => {
      const calculatedResults = distributeValue(start, end, divisions, startHour, profile, prec);
      setResults(calculatedResults);
      setTotalDiff(end - start);
      setIsCalculating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-100 relative">
      
      {/* Aesthetic Minimalist Header (Top Right) */}
      <header className="absolute top-6 right-6 z-20">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/50 hover:shadow-md transition-all cursor-default">
           <div className="flex flex-col items-end leading-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Smart Tool</span>
              <span className="text-sm font-bold text-slate-800">Water<span className="text-indigo-600">Estimator</span></span>
           </div>
           <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <Droplets className="w-4 h-4 fill-current" />
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-20">
        
        {/* Intro Text */}
        <div className="mb-12 max-w-2xl mt-10 md:mt-0">
           <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Smart Meter <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Analytics Engine</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
            Generate realistic, fluctuating water usage patterns with AI-driven distribution. Perfect for precise residential and commercial estimation.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Input Section */}
          <section className="lg:col-span-5 space-y-6 sticky top-8 z-10">
            <InputForm onCalculate={handleCalculate} isCalculating={isCalculating} />
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7 space-y-6">
            {results.length > 0 ? (
              <>
                <AnalysisChart results={results} precision={precision} />
                <ResultsTable results={results} totalDiff={totalDiff} precision={precision} />
              </>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/40 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6 shadow-indigo-100">
                  <Droplets className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Ready to Analyze</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                  Configure your parameters on the left to generate a smart distribution report.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-slate-200/60 pt-8 text-center">
          <p className="text-sm font-medium text-slate-400">&copy; {new Date().getFullYear()} Smart Water Analytics.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
