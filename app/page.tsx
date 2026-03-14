"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { filterForecasts, DataPoint } from '@/lib/utils';

export default function ForecastApp() {
  const [horizon, setHorizon] = useState(4);
  // Default range: First 3 days of Jan 2024
  const [startTime, setStartTime] = useState("2024-01-01T00:00");
  const [endTime, setEndTime] = useState("2024-01-04T00:00");
  
  const [data, setData] = useState<{ actuals: DataPoint[], forecasts: DataPoint[] }>({ actuals: [], forecasts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, f] = await Promise.all([
          fetch('/data/actuals_jan.csv').then(res => res.text()),
          fetch('/data/forecasts_jan.csv').then(res => res.text())
        ]);
        setData({
          actuals: Papa.parse<DataPoint>(a, { header: true, dynamicTyping: true }).data,
          forecasts: Papa.parse<DataPoint>(f, { header: true, dynamicTyping: true }).data
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { chartData, mae } = useMemo(() => {
    if (data.actuals.length === 0) return { chartData: [], mae: 0 };

    const filteredF = filterForecasts(data.forecasts, horizon);
    const fMap = new Map(filteredF.map(f => [new Date(f.startTime).toISOString(), Number(f.generation)]));

    let totalError = 0;
    let count = 0;

    const startFilter = new Date(startTime).getTime();
    const endFilter = new Date(endTime).getTime();

    const combined = data.actuals
      .filter(a => {
        const t = new Date(a.startTime).getTime();
        return a.startTime && t >= startFilter && t <= endFilter;
      })
      .map(a => {
        const iso = new Date(a.startTime).toISOString();
        const actual = Number(a.generation) || 0;
        const forecast = fMap.get(iso) ?? null;

        if (forecast !== null) {
          totalError += Math.abs(actual - forecast);
          count++;
        }

        return {
          time: new Date(a.startTime).toLocaleTimeString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          actual,
          forecast,
        };
      });

    return { 
      chartData: combined,
      mae: count > 0 ? Math.round(totalError / count) : 0 
    };
  }, [data, horizon, startTime, endTime]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900 font-mono text-blue-400">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
        <p className="tracking-tighter uppercase">Initializing National Grid Data Stream...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase italic">1. Forecast monitoring app</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">UK Wind Energy • Jan 2024</p>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col items-center justify-center px-8 py-3 bg-slate-900 rounded-2xl text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mean Absolute Error</span>
            <span className="text-3xl font-mono font-bold text-blue-400">{mae.toLocaleString()} <small className="text-sm">MW</small></span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b pb-4">Configuration</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase">Horizon Lead</label>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md">{horizon}h</span>
                </div>
                <input 
                  type="range" min="0" max="48" value={horizon} 
                  onChange={e => setHorizon(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase">Start Window</label>
                  <input 
                    type="datetime-local" 
                    value={startTime} 
                    min="2024-01-01T00:00" 
                    max="2024-01-31T23:59"
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase">End Window</label>
                  <input 
                    type="datetime-local" 
                    value={endTime} 
                    min="2024-01-01T00:00" 
                    max="2024-01-31T23:59"
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-3xl text-white space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Analysis Insight</h3>
              <p className="text-sm leading-relaxed font-medium">
                Longer horizons typically increase MAE as atmospheric volatility compounds over time.
              </p>
            </div>
          </aside>

          {/* Visualization Panel */}
          <main className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl min-h-[500px]">
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  tick={{fontSize: 9, fill: '#94a3b8'}} 
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis 
                  tick={{fontSize: 10, fill: '#94a3b8'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={false} 
                  name="Actual Generation" 
                  isAnimationActive={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false} 
                  name="Forecasted Value" 
                  connectNulls 
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </main>
        </div>
      </div>
    </div>
  );
}