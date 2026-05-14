'use client';

import React from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    ResponsiveContainer, 
    Cell, 
    RadialBarChart, 
    RadialBar,
    PolarAngleAxis
} from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Cpu, CheckCircle2, Info } from 'lucide-react';

interface MetricsData {
    r2_train: number;
    r2_test: number;
    mae: number;
    model_name: string;
    features: string[];
    training_samples: number;
    test_samples: number;
}

interface ModelMetricsCardProps {
    metrics: MetricsData | null;
}

const ModelMetricsCard: React.FC<ModelMetricsCardProps> = ({ metrics }) => {
    const { t } = useTranslation();
    const { getCurrencySymbol } = useCurrency();

    if (!metrics) {
        return (
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse mt-4">
                <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                <div className="h-32 bg-white/5 rounded-xl mb-4"></div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-white/5 rounded-lg"></div>
                    <div className="h-16 bg-white/5 rounded-lg"></div>
                    <div className="h-16 bg-white/5 rounded-lg"></div>
                </div>
            </div>
        );
    }

    const barData = [
        { name: 'Train', value: metrics.r2_train * 100, color: '#7C3AED' },
        { name: 'Test', value: metrics.r2_test * 100, color: '#2563EB' }
    ];

    const testScore = Math.round(metrics.r2_test * 100);
    const gaugeColor = testScore > 80 ? '#22C55E' : testScore > 60 ? '#F59E0B' : '#EF4444';

    const radialData = [
        { name: 'R2', value: testScore, fill: gaugeColor }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mt-4"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold leading-tight flex items-center gap-2">
                        {t('predict.metrics.title')}
                        <Cpu className="text-purple-400 w-4 h-4" />
                    </h3>
                    <p className="text-white/40 text-[11px] font-medium tracking-wide flex items-center gap-1 mt-0.5 uppercase">
                        {metrics.model_name}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">{t('predict.metrics.live')}</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="h-[140px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={barData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        barSize={12}
                    >
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            stroke="#ffffff60" 
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={45}
                        />
                        <Bar 
                            dataKey="value" 
                            radius={[0, 4, 4, 0]}
                            label={{ 
                                position: 'right', 
                                fill: '#ffffff90', 
                                fontSize: 11,
                                formatter: (val: number) => `${val.toFixed(1)}%` 
                            }}
                        >
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Gauge Chart */}
            <div className="flex flex-col items-center justify-center mb-6 py-2 border-y border-white/[0.05]">
                <div className="relative h-[120px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="70%" 
                            outerRadius="100%" 
                            barSize={12} 
                            data={radialData} 
                            startAngle={180} 
                            endAngle={0}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                cornerRadius={10}
                                background={{ fill: 'rgba(255,255,255,0.05)' }}
                                dataKey="value"
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
                        <span className="text-2xl font-black text-white leading-none">{testScore}%</span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{t('predict.metrics.r2')}</span>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col items-center text-center">
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter mb-1">{t('predict.metrics.mae')}</span>
                    <span className="text-sm font-bold text-white">{getCurrencySymbol()}{metrics.mae.toLocaleString()}</span>
                    <span className="text-[8px] text-white/20 font-medium leading-tight mt-1">Mean Absolute Error</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col items-center text-center">
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter mb-1">{t('predict.metrics.train')}</span>
                    <span className="text-sm font-bold text-white">{metrics.training_samples}</span>
                    <span className="text-[8px] text-white/20 font-medium leading-tight mt-1">Training samples</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col items-center text-center">
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-tighter mb-1">{t('predict.metrics.test')}</span>
                    <span className="text-sm font-bold text-white">{metrics.test_samples}</span>
                    <span className="text-[8px] text-white/20 font-medium leading-tight mt-1">Test samples</span>
                </div>
            </div>

            {/* Explanation */}
            <div className="flex gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="bg-white/5 p-1.5 rounded-lg h-fit">
                    <Info size={14} className="text-white/40" />
                </div>
                <p className="text-[10px] leading-relaxed text-white/40 font-medium italic">
                    {t('predict.metrics.explanation')}
                </p>
            </div>
        </motion.div>
    );
};

export default ModelMetricsCard;
