
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, ReferenceLine
} from 'recharts';
import { IndicatorResult } from '../types';

interface IndicatorChartProps {
  data: IndicatorResult[];
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ data }) => {
  // Format data for radar
  const chartData = data.map(item => ({
    subject: item.name.split(' ').map(s => s[0]).join(''), // Abbreviations
    fullName: item.name,
    score: item.score,
    absScore: Math.abs(item.score),
    severity: item.severity,
    fullMark: 5
  }));

  return (
    <div className="h-[350px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 5]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Crisis Score"
            dataKey="absScore"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.6}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
            formatter={(value: any, name: any, props: any) => [`Score: ${props.payload.score}`, props.payload.fullName]}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="text-[10px] text-slate-500 uppercase font-mono mt-4 flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-red-500"></div>
          Signal Intensity
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">Legend: SF=Security Failure, LN=LNA Tension, CU=Civil Unrest...</span>
        </div>
      </div>
    </div>
  );
};

export default IndicatorChart;
