'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { 
    Target, 
    ShieldCheck, 
    Zap, 
    CheckCircle2, 
    Sparkles,
    Users,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';

export default function AboutPage() {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.contentWrapper}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase mb-6">
                            <Target className="w-4 h-4" />
                            {t('about_page.mission_badge')}
                        </div>
                        <h1 className={styles.title}>
                            {t('about_page.title')} <span className={styles.highlight}>{t('about_page.highlight')}</span>
                        </h1>
                        
                        <p className={styles.intro}>
                            {t('about_page.description')}
                        </p>
                    </motion.div>

                    <div className={styles.statsGrid}>
                        {[
                            { value: '500+', label: t('about_page.fleet'), icon: <TrendingUp /> },
                            { value: '12k', label: t('about_page.clients'), icon: <Users /> },
                            { value: '99%', label: t('about_page.approval'), icon: <ShieldCheck /> }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 + 0.3 }}
                                className={styles.statCard}
                            >
                                <div style={{ color: '#7c3aed', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    {/* Icon placeholder if needed */}
                                </div>
                                <div className={styles.statValue}>{stat.value}</div>
                                <div className={styles.statLabel}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.section 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className={styles.visionSection}
                    >
                        <h2 className={styles.visionTitle}>
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            {t('about_page.vision_title')}
                        </h2>
                        <p className={styles.visionText}>
                            {t('about_page.vision_desc')}
                        </p>

                        <div className={styles.featureList}>
                            {[
                                t('about_page.f1'),
                                t('about_page.f2'),
                                t('about_page.f3'),
                                t('about_page.f4'),
                                t('about_page.f5'),
                                t('about_page.f6')
                            ].map((feature, idx) => (
                                <div key={idx} className={styles.featureItem}>
                                    <CheckCircle2 className={styles.featureIcon} size={20} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        style={{ marginTop: '8rem', textAlign: 'center' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700, marginBottom: '1rem' }}>{t('about_page.ready_title')}</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '2.5rem' }}>{t('about_page.ready_subtitle')}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                             <button style={{ 
                                padding: '1rem 2.5rem', 
                                background: '#7c3aed', 
                                color: 'white', 
                                borderRadius: '0.75rem', 
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer'
                            }}>{t('about_page.get_started')}</button>
                             <button style={{ 
                                padding: '1rem 2.5rem', 
                                background: 'rgba(255,255,255,0.05)', 
                                color: 'white', 
                                borderRadius: '0.75rem', 
                                fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer'
                            }}>{t('about_page.view_fleet')}</button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
