'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  Legend, ReferenceLine, LabelList,
  LineChart, Line
} from 'recharts';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Cpu, Activity, AlertCircle, TrendingUp, Trophy, CheckCircle2, BarChart3 } from 'lucide-react';

interface ModelResult {
    model: string;
    r2_train: number;
    r2_test: number;
    r2_mean: number;
    mae: number;
    rmse: number;
    cv_scores: number[];
    color: string;
}

interface MetricsData {
    rental: ModelResult[];
    leasing: ModelResult[];
}

interface R2ScoreChartProps {
    metrics: MetricsData;
}

const R2ScoreChart: React.FC<R2ScoreChartProps> = ({ metrics }) => {
  const { t } = useTranslation();
  const { getCurrencySymbol } = useCurrency();
  const [activeTarget, setActiveTarget] = useState<'rental' | 'leasing'>('rental');

  const currentResults = metrics[activeTarget] || [];
  
  // Format data for R2 Comparison Chart (0 to 1 scale)
  const r2Data = currentResults.map(r => ({
    model: r.model,
    r2_train: r.r2_train,
    r2_test: r.r2_test,
  }));

  // Format data for Error Comparison Chart
  const errorData = currentResults.map(r => ({
    model: r.model,
    mae: r.mae,
    rmse: r.rmse,
  }));

  // Find best model based on Test R2
  const bestModel = [...currentResults].sort((a, b) => b.r2_test - a.r2_test)[0];

  return (
    <div className="bg-[#0F172A]/40 border border-white/[0.08] rounded-2xl p-6 mt-4 relative overflow-hidden backdrop-blur-xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-white text-lg font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            {t('models.title')}
          </h3>
          <p className="text-[#94A3B8] text-xs font-medium uppercase tracking-wider mt-1">Оценка точности прогнозирования</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
          <button 
            onClick={() => setActiveTarget('rental')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTarget === 'rental' ? 'bg-purple-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <span>🚗</span> {t('models.rental_tab')}
          </button>
          <button 
            onClick={() => setActiveTarget('leasing')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${activeTarget === 'leasing' ? 'bg-purple-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <span>📋</span> {t('models.leasing_tab')}
          </button>
        </div>
      </div>

      {/* CHART 1: R² SCORE COMPARISON */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
            <h4 className="text-white text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {t('models.chart1')}
            </h4>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={r2Data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis 
                dataKey="model" 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                domain={[0, 1]}
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: 'R² Score', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12, offset: -10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1E293B', 
                  border: '1px solid #334155',
                  borderRadius: 8, 
                  color: 'white',
                  fontSize: 12
                }}
                formatter={(v: any) => [Number(v).toFixed(3), 'Score']}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 20 }} />
              
              <ReferenceLine 
                y={0.8} 
                stroke="#16A34A" 
                strokeDasharray="4 2"
                label={{ value: 'Хорошо', fill: '#4ADE80', fontSize: 11, position: 'right' }} 
              />
              <ReferenceLine 
                y={0.6} 
                stroke="#D97706" 
                strokeDasharray="4 2"
                label={{ value: 'Приемлемо', fill: '#FCD34D', fontSize: 11, position: 'right' }} 
              />

              <Bar dataKey="r2_train" name={t('models.table.r2train')} fill="#7C3AED" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="r2_train" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fill: 'white', fontSize: 11 }} />
              </Bar>
              <Bar dataKey="r2_test" name={t('models.table.r2test')} fill="#2563EB" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="r2_test" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fill: 'white', fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 3: CROSS-VALIDATION LINE CHART */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
            <h4 className="text-white text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                {t('models.chart3')}
            </h4>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis 
                dataKey="fold" 
                type="number"
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                label={{ value: 'Fold', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 1]}
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: 'R² Score', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12, offset: -10 }}
              />
              <Tooltip 
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(v: any, name: string) => [Number(v).toFixed(3), name]}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 20 }} />
              
              {currentResults.map((m) => (
                <Line 
                    key={m.model}
                    data={m.cv_scores.map((v, i) => ({ fold: i + 1, value: v }))}
                    type="monotone"
                    dataKey="value"
                    name={m.model}
                    stroke={m.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: m.color, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: ERROR METRICS (MAE & RMSE) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
            <h4 className="text-white text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                {t('models.chart2')}
            </h4>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis 
                dataKey="model" 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${getCurrencySymbol()}${v.toLocaleString()}`}
                label={{ value: `Error Value (${getCurrencySymbol()})`, angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12, offset: -10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1E293B', 
                  border: '1px solid #334155',
                  borderRadius: 8, 
                  color: 'white',
                  fontSize: 12
                }}
                formatter={(v: any) => [`${getCurrencySymbol()}${v.toLocaleString()}`, 'Ошибка']}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 20 }} />
              
              <Bar dataKey="mae" name={t('models.table.mae')} fill="#F59E0B" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="mae" position="top" formatter={(v: number) => v > 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)} style={{ fill: 'white', fontSize: 11 }} />
              </Bar>
              <Bar dataKey="rmse" name={t('models.table.rmse')} fill="#EF4444" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="rmse" position="top" formatter={(v: number) => v > 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)} style={{ fill: 'white', fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SUMMARY TABLE */}
      <div className="mb-12 overflow-x-auto">
        <h4 className="text-white text-sm font-bold flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Сводная таблица производительности
        </h4>
        <div className="min-w-[600px]">
            <table className="w-full border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-[#94A3B8] text-[11px] uppercase tracking-wider text-left">
                        <th className="px-4 py-2 font-black">{t('models.table.model')}</th>
                        <th className="px-4 py-2 font-black">{t('models.table.r2train')}</th>
                        <th className="px-4 py-2 font-black">{t('models.table.r2test')}</th>
                        <th className="px-4 py-2 font-black">{t('models.table.mae')}</th>
                        <th className="px-4 py-2 font-black">{t('models.table.rmse')}</th>
                        <th className="px-4 py-2 font-black">🏆</th>
                    </tr>
                </thead>
                <tbody>
                    {currentResults.map((r) => {
                        const isBest = r.model === bestModel?.model;
                        return (
                            <tr 
                                key={r.model} 
                                className={`group transition-all duration-300 ${isBest ? 'bg-[#16A34A]/10' : 'bg-[#1E293B]/60'} hover:bg-white/[0.05]`}
                            >
                                <td className={`px-4 py-3 text-white text-sm font-semibold rounded-l-xl ${isBest ? 'border-l-4 border-[#16A34A]' : ''}`}>
                                    {r.model}
                                </td>
                                <td className="px-4 py-3 text-[#94A3B8] text-sm">{(r.r2_train).toFixed(3)}</td>
                                <td className={`px-4 py-3 text-sm font-bold ${isBest ? 'text-[#16A34A]' : 'text-white'}`}>
                                    {(r.r2_test).toFixed(3)}
                                </td>
                                <td className="px-4 py-3 text-[#94A3B8] text-sm">{getCurrencySymbol()}{r.mae.toLocaleString()}</td>
                                <td className="px-4 py-3 text-[#94A3B8] text-sm">{getCurrencySymbol()}{r.rmse.toLocaleString()}</td>
                                <td className="px-4 py-3 rounded-r-xl">
                                    {isBest && <Trophy className="w-5 h-5 text-yellow-500" />}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* CONCLUSION CARD */}
      {bestModel && (
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                   <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 text-sm font-bold uppercase tracking-widest">{t('models.best')}</span>
                   </div>
                   <h2 className="text-white text-3xl font-black">{bestModel.model}</h2>
                </div>
                <div className="flex gap-4">
                    <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-black mb-1">R² Test Accuracy</div>
                        <div className="text-2xl font-black text-white">{bestModel.r2_test.toFixed(3)}</div>
                    </div>
                    <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-black mb-1">MAE Error</div>
                        <div className="text-2xl font-black text-white">{getCurrencySymbol()}{bestModel.mae.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* DESCRIPTION */}
      <p className="text-[11px] text-[#64748B] mt-8 pt-4 border-t border-white/[0.05] leading-relaxed italic">
        Метрики получены на основе синтетических данных, приближенных к текущим рыночным условиям Казахстана. Random Forest демонстрирует лучшую обобщающую способность в данных условиях.
      </p>
    </div>
  );
};

export default R2ScoreChart;
