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

  const handleCalculate = (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile) => {
    setIsCalculating(true);
    setResults([]); // Clear previous results to trigger animation
    
    // Simulate "Smart Processing" time
    setTimeout(() => {
      const calculatedResults = distributeValue(start, end, divisions, startHour, profile);
      setResults(calculatedResults);
      setTotalDiff(end - start);
      setIsCalculating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-xl shadow-indigo-100 mb-2">
            <Droplets className="w-10 h-10 text-indigo-500 fill-indigo-500/20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Smart Water <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Estimator</span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-lg">
            AI-driven distribution for precise meter reading analysis with fluctuating usage patterns.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Input Section */}
          <section className="lg:col-span-5 space-y-6">
            <InputForm onCalculate={handleCalculate} isCalculating={isCalculating} />
            
            {/* Quick Tip Card */}
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 hidden lg:block">
              <h3 className="font-bold text-lg mb-2">Did you know?</h3>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Residential water usage typically peaks twice a day: once in the morning (6-9 AM) and again in the evening (5-8 PM). Our "Smart" profile mimics this automatically.
              </p>
            </div>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7 space-y-6">
            {results.length > 0 ? (
              <>
                <AnalysisChart results={results} />
                <ResultsTable results={results} totalDiff={totalDiff} />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Droplets className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Ready to Analyze</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                  Enter your meter readings to generate a smart distribution report.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Smart Water Analytics. Precision Engineering.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
