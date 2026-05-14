'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  Legend, ReferenceLine,
  LineChart, Line, ScatterChart, Scatter, Label,
  Cell
} from 'recharts';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { AlertCircle, TrendingDown } from 'lucide-react';

interface ModelResult {
    model: string;
    r2_train: number;
    r2_test: number;
    r2_mean: number;
    mae: number;
    rmse: number;
    mape: number;
    mape_str: string;
    r2_std: number;
    cv_scores: number[];
    color: string;
    scatter: { actual: number; predicted: number }[];
}

interface MetricsData {
    metadata: {
        train_samples: number;
        test_samples: number;
        total_models: number;
    };
    results: {
        rental: ModelResult[];
        leasing: ModelResult[];
    };
}

export default function ModelsPage() {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [tab, setTab] = useState<'rental' | 'leasing'>('rental');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        axios.get(`${baseUrl}/model/metrics`)
            .then(res => {
                setMetrics(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch metrics", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '24px', textAlign: 'center' }}>
                <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
                <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Data Error</h1>
                <p style={{ color: '#94A3B8', marginTop: '8px' }}>Failed to retrieve model metrics. Ensure backend is running.</p>
            </div>
        );
    }

    const currentResults = metrics.results[tab] || [];
    const allResults = [...metrics.results.rental, ...metrics.results.leasing];
    
    const getMapeColor = (mape: number) => {
        if (mape < 0.05) return '#4ADE80';
        if (mape < 0.15) return '#FB923C';
        return '#F87171';
    };
    
    // Derived metrics
    const bestGlobalR2 = allResults.length ? Math.max(...allResults.map(r => r.r2_test)).toFixed(3) : 'N/A';
    const lowestGlobalMAE = allResults.length ? Math.min(...allResults.map(r => r.mae)) : 0;
    const bestGlobalMAPE = allResults.length ? Math.min(...allResults.map(r => r.mape)) : 0;
    const totalSamples = metrics.metadata.train_samples + metrics.metadata.test_samples;

    const bestModel = [...currentResults].sort((a, b) => b.r2_test - a.r2_test)[0];
    const bestModelName = bestModel ? bestModel.model : 'N/A';
    const bestR2 = bestModel ? bestModel.r2_test.toFixed(3) : 'N/A';
    const bestMaeFormatted = bestModel ? formatPrice(bestModel.mae) : '0';

    const r2Data = currentResults.map(r => ({
        model: r.model,
        r2_train: r.r2_train,
        r2_test: r.r2_test,
    }));

    const errorData = currentResults.map(r => ({
        model: r.model,
        mae: r.mae,
        rmse: r.rmse,
    }));

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', overflow: 'hidden' }}>
            
            <div style={{ padding: '40px 0' }}>
                <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
                    
                    {/* HEADER */}
                    <div style={{ marginBottom: '32px', boxSizing: 'border-box' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>
                            ML Models Analysis
                        </h1>
                        <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '8px' }}>
                            Accuracy analysis for price prediction
                        </p>
                    </div>

                    {/* STATS ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px', width: '100%', boxSizing: 'border-box' }}>
                        {/* Card 1 */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                            <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', margin: '0 0 8px' }}>
                                Models Trained
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0 }}>{metrics.metadata.total_models}</p>
                        </div>
                        {/* Card 2 */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                            <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', margin: '0 0 8px' }}>
                                Best R² Score
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#A78BFA', margin: 0 }}>{bestGlobalR2}</p>
                        </div>
                        {/* Card 3 */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                            <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', margin: '0 0 8px' }}>
                                Min MAE
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#60A5FA', margin: 0 }}>{lowestGlobalMAE > 0 ? formatPrice(lowestGlobalMAE) : '0'}</p>
                        </div>
                        {/* Card 4 */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                            <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', margin: '0 0 8px' }}>
                                {t('models.stats.datapoints')}
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#4ADE80', margin: 0 }}>{totalSamples.toLocaleString()}</p>
                        </div>
                        {/* Card 5: Best MAPE */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                            <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', margin: '0 0 8px' }}>
                                {t('models.stats.best_mape')}
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: getMapeColor(bestGlobalMAPE), margin: 0 }}>
                                {bestGlobalMAPE.toFixed(4)}
                            </p>
                        </div>
                    </div>

                    {/* TABS */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', boxSizing: 'border-box' }}>
                        <button onClick={() => setTab('rental')}
                            style={{
                                padding: '8px 20px', borderRadius: '8px',
                                border: 'none', cursor: 'pointer',
                                fontSize: '14px', fontWeight: 600,
                                background: tab === 'rental' ? '#7C3AED' : 'rgba(255,255,255,0.06)',
                                color: 'white'
                            }}>
                            🚗 Rental Model
                        </button>
                        <button onClick={() => setTab('leasing')}
                            style={{
                                padding: '8px 20px', borderRadius: '8px',
                                border: 'none', cursor: 'pointer',
                                fontSize: '14px', fontWeight: 600,
                                background: tab === 'leasing' ? '#7C3AED' : 'rgba(255,255,255,0.06)',
                                color: 'white'
                            }}>
                            📋 Leasing Model
                        </button>
                    </div>

                    {/* CHART 1: R2 SCORE */}
                    <div style={{ background: '#1E1B4B', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                            R² Score Comparison
                        </h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={r2Data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="model" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 1]} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12 }} />
                                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                                    <ReferenceLine y={0.8} stroke="#16A34A" strokeDasharray="4 2" />
                                    <ReferenceLine y={0.6} stroke="#D97706" strokeDasharray="4 2" />
                                    <Bar dataKey="r2_train" name="Train Score" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="r2_test" name="Test Score" fill="#2563EB" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 2: ERROR METRICS */}
                    <div style={{ background: '#1E1B4B', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                            Model Error Metrics (MAE & RMSE)
                        </h3>
                        <div style={{ height: '280px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={errorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="model" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12 }} />
                                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                                    <Bar dataKey="mae" name="MAE" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="rmse" name="RMSE" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 3: CROSS VALIDATION */}
                    <div style={{ background: '#1E1B4B', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
                        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                            {t('models.chart3')}
                        </h3>
                        <div style={{ height: '280px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="fold" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 1]} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12 }} />
                                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                                    {currentResults.map((m) => (
                                        <Line 
                                            key={m.model}
                                            data={m.cv_scores.map((v, i) => ({ fold: i + 1, value: v }))}
                                            type="monotone"
                                            dataKey="value"
                                            name={m.model}
                                            stroke={m.color}
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: m.color }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 4: MAPE Error Comparison */}
                    <div style={{ background: '#1E1B4B', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                                    {t('models.mape.title')}
                                </h3>
                                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                                    {t('models.mape.subtitle')}
                                </p>
                            </div>
                            <div title="MAPE < 0.05: Excellent, 0.05-0.15: Good, 0.15-0.25: Fair, > 0.25: Poor" style={{ cursor: 'help' }}>
                                <TrendingDown size={20} color="#94A3B8" />
                            </div>
                        </div>
                        
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={currentResults.map(r => ({ name: r.model, mape: r.mape }))} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} angle={-15} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(2)} />
                                    <Tooltip 
                                        contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12 }} 
                                        formatter={(v: any) => [`${Number(v).toFixed(4)}`, 'MAPE']}
                                    />
                                    <ReferenceLine y={0.05} stroke="#4ADE80" strokeDasharray="4 2" label={{ value: 'Excellent', fill: '#4ADE80', fontSize: 10, position: 'right' }} />
                                    <ReferenceLine y={0.15} stroke="#FB923C" strokeDasharray="4 2" label={{ value: 'Acceptable', fill: '#FB923C', fontSize: 10, position: 'right' }} />
                                    <Bar dataKey="mape" radius={[6, 6, 0, 0]}>
                                        {currentResults.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getMapeColor(entry.mape)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* NEW SECTION: PREDICTED VS ACTUAL SCATTER PLOTS */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                                {t('models.scatter.title')}
                            </h3>
                            <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '4px' }}>
                                {t('models.scatter.subtitle')}
                            </p>
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                            gap: '16px' 
                        }}>
                            {currentResults.map((m) => {
                                const scatter = m.scatter || []
                                const allActual = scatter.map(p => p.actual)
                                const minVal = allActual.length ? Math.min(...allActual) * 0.9 : 0
                                const maxVal = allActual.length ? Math.max(...allActual) * 1.1 : 100000

                                const getDotColor = (actual: number, predicted: number) => {
                                    const error = Math.abs(actual - predicted) / actual
                                    if (error <= 0.1) return '#4ADE80'   // green - good
                                    if (error <= 0.25) return '#A78BFA'  // purple - ok
                                    return '#F87171'                      // red - bad
                                }

                                return (
                                    <div key={m.model} style={{
                                        background: '#1E1B4B',
                                        border: '1px solid rgba(124,58,237,0.3)',
                                        borderRadius: '16px',
                                        padding: '20px'
                                    }}>
                                        <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                                            {m.model}
                                        </h4>
                                        <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '12px' }}>
                                            R² = {m.r2_test.toFixed(3)}
                                        </p>
                                        
                                        <ResponsiveContainer width="100%" height={260}>
                                            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                
                                                <XAxis 
                                                    type="number" 
                                                    dataKey="actual"
                                                    name="Actual"
                                                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                                                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                                                    domain={[minVal, maxVal]}
                                                >
                                                    <Label 
                                                        value={t('models.scatter.xaxis')}
                                                        position="insideBottom"
                                                        offset={-15}
                                                        style={{ fill: '#94A3B8', fontSize: 11 }} />
                                                </XAxis>
                                                
                                                <YAxis
                                                    type="number"
                                                    dataKey="predicted"
                                                    name="Predicted"
                                                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                                                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                                                    domain={[minVal, maxVal]}
                                                >
                                                    <Label
                                                        value={t('models.scatter.yaxis')}
                                                        angle={-90}
                                                        position="insideLeft"
                                                        offset={10}
                                                        style={{ fill: '#94A3B8', fontSize: 11 }} />
                                                </YAxis>
                                                
                                                <Tooltip
                                                    cursor={{ strokeDasharray: '3 3' }}
                                                    contentStyle={{
                                                        background: '#1E293B',
                                                        border: '1px solid #334155',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        color: 'white'
                                                    }}
                                                    formatter={(value, name) => [
                                                        formatPrice(Number(value)), name
                                                    ]} 
                                                />
                                                
                                                <ReferenceLine
                                                    segment={[
                                                        { x: minVal, y: minVal },
                                                        { x: maxVal, y: maxVal }
                                                    ]}
                                                    stroke="#4ADE80"
                                                    strokeDasharray="6 3"
                                                    strokeWidth={1.5}
                                                    label={{
                                                        value: t('models.scatter.perfect'),
                                                        position: 'insideTopLeft',
                                                        fill: '#4ADE80',
                                                        fontSize: 10
                                                    }} 
                                                />
                                                
                                                <Scatter
                                                    name={m.model}
                                                    data={scatter}
                                                    shape={(props: any) => {
                                                        const { cx, cy, payload } = props
                                                        const color = getDotColor(payload.actual, payload.predicted)
                                                        return <circle cx={cx} cy={cy} r={4}
                                                            fill={color} opacity={0.8}
                                                            stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                                                    }} 
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* TABLE CARD */}
                    <div style={{ background: '#1E1B4B', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px', width: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Model</th>
                                    <th style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>R² Train</th>
                                    <th style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>{t('models.table.r2test')}</th>
                                    <th style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>{t('models.table.mae')}</th>
                                    <th style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>{t('models.table.mape')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentResults.map((r) => (
                                    <tr key={r.model} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '16px', color: 'white', fontWeight: 600 }}>{r.model}</td>
                                        <td style={{ padding: '16px', color: '#94A3B8' }}>{r.r2_train.toFixed(3)}</td>
                                        <td style={{ padding: '16px', color: 'white', fontWeight: 800 }}>{r.r2_test.toFixed(3)}</td>
                                        <td style={{ padding: '16px', color: '#94A3B8' }}>{formatPrice(r.mae)}</td>
                                        <td style={{ padding: '16px', color: getMapeColor(r.mape), textAlign: 'right', fontWeight: 700 }}>{r.mape_str}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* BEST MODEL CARD */}
                    <div style={{ background: 'linear-gradient(135deg, #1E1B4B, #0F172A)', border: '2px solid #16A34A', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' }}>
                        <span style={{ fontSize: '12px', color: '#4ADE80', fontWeight: 700, letterSpacing: '1px' }}>
                            🏆 BEST MODEL
                        </span>
                        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '8px 0' }}>
                            {bestModelName}
                        </h2>
                        <p style={{ color: '#A78BFA', fontSize: '14px' }}>
                            R² {bestR2} · MAE {bestMaeFormatted} · MAPE {bestModel?.mape_str || '0%'}
                        </p>
                    </div>

                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '40px', textAlign: 'center', fontStyle: 'italic', boxSizing: 'border-box' }}>
                        Analysis based on Data Engine v2.0. Continuous retraining enabled for peak prediction stability.
                    </p>

                </div>
            </div>
        </div>
    );
}
