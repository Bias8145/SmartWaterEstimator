import React, { useState } from 'react';
import { Calculator, AlertCircle, RefreshCw, Clock, Building2, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { UsageProfile } from '../utils/calculator';

interface InputFormProps {
  onCalculate: (start: number, end: number, divisions: number, startHour: number, profile: UsageProfile) => void;
  isCalculating: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate, isCalculating }) => {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [divisions, setDivisions] = useState<string>('24');
  const [startHour, setStartHour] = useState<string>('08');
  const [profile, setProfile] = useState<UsageProfile>('residential');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const startNum = parseFloat(start);
    const endNum = parseFloat(end);
    const divNum = parseInt(divisions);
    const hourNum = parseInt(startHour);

    if (isNaN(startNum) || isNaN(endNum) || isNaN(divNum)) {
      setError('Please enter valid numbers.');
      return;
    }

    if (divNum <= 0) {
      setError('Duration must be greater than 0.');
      return;
    }

    if (startNum >= endNum) {
      setError('End meter > Start meter required.');
      return;
    }

    onCalculate(startNum, endNum, divNum, hourNum, profile);
  };

  return (
    <Card className="w-full border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-indigo-900">
          <Calculator className="w-6 h-6 text-indigo-500" />
          Smart Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Meter Readings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Start Meter
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="flex h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 text-lg font-mono text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                End Meter
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="flex h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 text-lg font-mono text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Start Time (Hour)
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="flex h-12 w-full appearance-none rounded-2xl border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="744"
                value={divisions}
                onChange={(e) => setDivisions(e.target.value)}
                className="flex h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
          </div>

          {/* Usage Profile */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Usage Profile (Pattern)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setProfile('residential')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  profile === 'residential'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Residential</span>
              </button>
              <button
                type="button"
                onClick={() => setProfile('commercial')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  profile === 'commercial'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-xs font-medium">Commercial</span>
              </button>
              <button
                type="button"
                onClick={() => setProfile('flat')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  profile === 'flat'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="w-6 h-6" />
                <span className="text-xs font-medium">Flat/Avg</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isCalculating}
            className="w-full h-14 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Processing Smart Data...
              </>
            ) : (
              'Generate Smart Analysis'
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;
