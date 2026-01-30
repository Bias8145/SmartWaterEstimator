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
  const lineColor = isDark ? '#ffffff' : '#1e293b'; // White / Slate-800

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#27272a' : '#e2e8f0',
      borderRadius: 8,
      padding: 12,
      textStyle: { color: isDark ? '#f4f4f5' : '#475569', fontSize: 12, fontFamily: 'inherit' },
      formatter: (params: any) => {
          const val = params[0].value;
          return `
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 4px;">${t.time} ${params[0].name}</div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${isDark ? '#fff' : '#1e293b'}">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${lineColor};"></span>
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
        lineStyle: { width: 2, color: lineColor }, 
        areaStyle: {
          color: lineColor,
          opacity: 0.05
        },
        data: values
      }
    ]
  };

  return (
    <Card className="w-full bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800">
        <CardTitle className="text-slate-500 dark:text-zinc-500 text-[11px] md:text-[13px] uppercase tracking-wide">
          {t.chart_title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-[1rem] p-3 text-center">
            <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold mb-1">{t.peak}</p>
            <p className="text-[13px] md:text-[15px] font-bold text-slate-800 dark:text-white">{formatNumber(maxVal, precision)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-[1rem] p-3 text-center">
            <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold mb-1">{t.avg}</p>
            <p className="text-[13px] md:text-[15px] font-bold text-slate-600 dark:text-zinc-300">{formatNumber(avgVal, precision)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-[1rem] p-3 text-center">
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
