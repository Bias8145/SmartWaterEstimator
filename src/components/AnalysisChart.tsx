import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CalculationResult } from '../utils/calculator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { LineChart } from 'lucide-react';

interface AnalysisChartProps {
  results: CalculationResult[];
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({ results }) => {
  if (results.length === 0) return null;

  const hours = results.map(r => r.hourLabel);
  const values = results.map(r => r.value);
  
  // Find stats
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const avgVal = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      padding: 12,
      textStyle: { color: '#1e293b' },
      formatter: '{b} <br/> Usage: <b>{c} m³</b>'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      show: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: '#e2e8f0' }
      },
      axisLabel: { color: '#64748b' }
    },
    series: [
      {
        name: 'Usage',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#6366f1',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(99, 102, 241, 0.3)',
          shadowBlur: 10
        },
        lineStyle: {
          width: 4,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#6366f1' }, // Indigo 500
              { offset: 1, color: '#ec4899' }  // Pink 500
            ]
          }
        },
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
    <Card className="w-full overflow-hidden border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-700">
          <LineChart className="w-5 h-5 text-indigo-500" />
          Smart Usage Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Peak</p>
            <p className="text-xl font-bold text-indigo-700">{maxVal.toFixed(1)}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Average</p>
            <p className="text-xl font-bold text-emerald-700">{avgVal}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lowest</p>
            <p className="text-xl font-bold text-slate-700">{minVal.toFixed(1)}</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisChart;
