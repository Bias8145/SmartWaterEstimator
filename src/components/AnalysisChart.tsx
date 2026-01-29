import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CalculationResult, formatNumber } from '../utils/calculator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { LineChart } from 'lucide-react';
import { translations } from '../utils/translations';

interface AnalysisChartProps {
  results: CalculationResult[];
  precision: number;
  lang: 'id' | 'en';
  theme: 'dark' | 'light';
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({ results, precision, lang, theme }) => {
  const t = translations[lang];
  if (results.length === 0) return null;

  const hours = results.map(r => r.id);
  const values = results.map(r => r.value);
  
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const avgVal = (values.reduce((a, b) => a + b, 0) / values.length);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#a1a1aa' : '#64748b';
  const gridColor = isDark ? '#27272a' : '#e2e8f0';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? '#3f3f46' : '#e2e8f0',
      textStyle: { color: isDark ? '#f4f4f5' : '#1e293b', fontSize: 12 },
      formatter: (params: any) => {
          const val = params[0].value;
          return `${t.time} ${params[0].name} <br/> ${t.usage}: <b>${formatNumber(val, precision)} m³</b>`;
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '2%',
      top: '10%',
      containLabel: true,
      show: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: gridColor }
      },
      axisLabel: { color: textColor, fontSize: 10 }
    },
    series: [
      {
        name: 'Usage',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ]
          }
        },
        data: values
      }
    ]
  };

  return (
    <Card className="w-full overflow-hidden border shadow-none">
      <CardHeader className="pb-4 border-b dark:border-zinc-800 border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          <LineChart className="w-4 h-4" />
          {t.chart_title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
          <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-3 text-center">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{t.peak}</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(maxVal, precision)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-3 text-center">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{t.avg}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{formatNumber(avgVal, precision)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-3 text-center">
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{t.lowest}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{formatNumber(minVal, precision)}</p>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisChart;
