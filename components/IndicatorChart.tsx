
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { IndicatorResult } from '../types';

interface IndicatorChartProps {
  data: IndicatorResult[];
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ data }) => {
  // Format data for radar with smarter abbreviations
  const chartData = data.map(item => {
    const words = item.name.split(' ');
    let subject = "";
    if (words.length >= 2) {
      subject = words.map(w => w[0]).join('').toUpperCase();
    } else {
      subject = item.name.substring(0, 3).toUpperCase();
    }

    return {
      subject,
      fullName: item.name,
      score: item.score,
      absScore: Math.abs(item.score),
      severity: item.severity,
      fullMark: 5
    };
  });

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
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '10px' }}
            formatter={(value: any, name: any, props: any) => [`Intensity: ${value}`, props.payload.fullName]}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="text-[9px] text-slate-500 uppercase font-mono mt-4 px-4 text-center leading-tight">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-sm bg-red-500"></div>
          Vector Intensity Mapping
        </div>
        <div className="opacity-50">
          Abbreviation legend based on initialisms of regional indicators.
        </div>
      </div>
    </div>
  );
};

export default IndicatorChart;
