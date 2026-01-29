import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CalculationResult, formatNumber } from '../utils/calculator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
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
  const textColor = isDark ? '#a1a1aa' : '#94a3b8';
  const gridColor = isDark ? '#27272a' : '#f1f5f9';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: 'transparent',
      borderRadius: 12,
      padding: 12,
      textStyle: { color: isDark ? '#f4f4f5' : '#475569', fontSize: 12, fontFamily: 'inherit' },
      formatter: (params: any) => {
          const val = params[0].value;
          return `
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 4px;">${t.time} ${params[0].name}</div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${isDark ? '#fff' : '#334155'}">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#6366f1;"></span>
              ${formatNumber(val, precision)} m³
            </div>
          `;
      }
    },
    grid: {
      left: '1%',
      right: '1%',
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
      axisLabel: { color: textColor, fontSize: 10, margin: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: gridColor, width: 1 }
      },
      axisLabel: { color: textColor, fontSize: 10 }
    },
    series: [
      {
        name: 'Usage',
        type: 'line',
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { width: 3, color: '#6366f1' }, // Indigo-500
        areaStyle: {
          color: isDark ? '#6366f1' : '#6366f1',
          opacity: 0.1
        },
        data: values
      }
    ]
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-slate-500 dark:text-zinc-500 text-[11px] md:text-[13px] uppercase tracking-wide">
          {t.chart_title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-[1.2rem] p-3 text-center">
            <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold mb-1">{t.peak}</p>
            <p className="text-[13px] md:text-[15px] font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(maxVal, precision)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-[1.2rem] p-3 text-center">
            <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold mb-1">{t.avg}</p>
            <p className="text-[13px] md:text-[15px] font-bold text-slate-600 dark:text-zinc-300">{formatNumber(avgVal, precision)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-[1.2rem] p-3 text-center">
            <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold mb-1">{t.lowest}</p>
            <p className="text-[13px] md:text-[15px] font-bold text-slate-600 dark:text-zinc-300">{formatNumber(minVal, precision)}</p>
          </div>
        </div>
        <div className="h-[180px] w-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisChart;
