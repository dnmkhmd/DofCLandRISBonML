'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './ComprehensiveCalculator.module.css';
import Button from './ui/Button';

export default function ComprehensiveCalculator() {
    const { t } = useTranslation();
    const { formatPrice, getCurrencySymbol } = useCurrency();

    const PRESETS = [
        {
            id: 'budget',
            name: t('calculator.budget'),
            icon: '🚗',
            dailyRate: 20000,
            carPrice: 10000000,
            description: t('calculator.budget_desc')
        },
        {
            id: 'standard',
            name: t('calculator.standard'),
            icon: '🚙',
            dailyRate: 45000,
            carPrice: 25000000,
            description: t('calculator.standard_desc')
        },
        {
            id: 'premium',
            name: t('calculator.premium'),
            icon: '✨',
            dailyRate: 85000,
            carPrice: 65000000,
            description: t('calculator.premium_desc')
        }
    ];

    const [activePreset, setActivePreset] = useState(PRESETS[0]);
    const [mode, setMode] = useState<'rent' | 'lease'>('rent');
    const [rentDays, setRentDays] = useState(30);
    const [leaseMonths, setLeaseMonths] = useState(36);
    const [downPayment, setDownPayment] = useState(5000);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className={styles.loading}>{t('calculator.loading')}</div>;

    // Rental Discount Logic
    let discount = 0;
    if (rentDays >= 30) discount = 0.20; // 20% for month
    else if (rentDays >= 7) discount = 0.10; // 10% for week

    const dailyPrice = activePreset.dailyRate * (1 - discount);
    const totalRent = rentDays * dailyPrice;

    // Leasing Logic
    const interestRate = 0.05; // 5% annual
    const p = activePreset.carPrice - downPayment;
    const r = interestRate / 12;
    const n = leaseMonths;
    const monthlyLease = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalLease = (monthlyLease * n) + downPayment;

    return (
        <div className={styles.wrapper}>
            <div className={styles.presetGrid}>
                {PRESETS.map(preset => (
                    <button 
                        key={preset.id}
                        className={`${styles.presetCard} ${activePreset.id === preset.id ? styles.activePreset : ''}`}
                        onClick={() => setActivePreset(preset)}
                    >
                        <span className={styles.presetIcon}>{preset.icon}</span>
                        <h3>{preset.name}</h3>
                        <p>{preset.description}</p>
                    </button>
                ))}
            </div>

            <div className={styles.mainCalc}>
                <div className={styles.calcHeader}>
                    <div className={styles.modeToggle}>
                        <button 
                            className={`${styles.modeBtn} ${mode === 'rent' ? styles.activeMode : ''}`}
                            onClick={() => setMode('rent')}
                        >
                            {t('calculator.short_term')}
                        </button>
                        <button 
                            className={`${styles.modeBtn} ${mode === 'lease' ? styles.activeMode : ''}`}
                            onClick={() => setMode('lease')}
                        >
                            {t('calculator.long_term')}
                        </button>
                    </div>

                    <div className={styles.currencyToggle} style={{ opacity: 0.5, pointerEvents: 'none' }}>
                        <span>{getCurrencySymbol()}</span>
                    </div>
                </div>

                <div className={styles.calcBody}>
                    {mode === 'rent' ? (
                        <div className={styles.inputGroup}>
                            <label>{t('calculator.rent_duration')}</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="180" 
                                value={rentDays}
                                onChange={(e) => setRentDays(parseInt(e.target.value))}
                                className={styles.range}
                            />
                            <div className={styles.rangeLabels}>
                                <span>{rentDays} {t('calculator.per_day')}s</span>
                                {discount > 0 && <span className={styles.discountTag}>-{discount * 100}% {t('calculator.discount_tag')}</span>}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.leaseInputs}>
                            <div className={styles.inputItem}>
                                <label>{t('calculator.down_payment_hint')}</label>
                                <input 
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(Math.max(0, parseInt(e.target.value) || 0))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputItem}>
                                <label>{t('calculator.term')}</label>
                                <select 
                                    value={leaseMonths}
                                    onChange={(e) => setLeaseMonths(parseInt(e.target.value))}
                                    className={styles.select}
                                >
                                    <option value="12">12 {t('calculator.months_count')}</option>
                                    <option value="24">24 {t('calculator.months_count')}</option>
                                    <option value="36">36 {t('calculator.months_count')}</option>
                                    <option value="48">48 {t('calculator.months_count')}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className={styles.resultSection}>
                        <div className={styles.mainResult}>
                            <span className={styles.resultLabel}>
                                {mode === 'rent' ? t('calculator.total_rent') : t('calculator.monthly_payment')}
                            </span>
                            <span className={styles.resultValue}>
                                {formatPrice(mode === 'rent' ? totalRent : monthlyLease)}
                            </span>
                        </div>
                        
                        <div className={styles.secondaryResults}>
                            {mode === 'rent' ? (
                                <>
                                    <div className={styles.secondaryItem}>
                                        <span>{t('calculator.daily_rate')}</span>
                                        <span>{formatPrice(dailyPrice)}/{t('calculator.per_day')}</span>
                                    </div>
                                    <div className={styles.secondaryItem}>
                                        <span>{t('calculator.standard_rate')}</span>
                                        <span>{formatPrice(activePreset.dailyRate)}/{t('calculator.per_day')}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.secondaryItem}>
                                        <span>{t('calculator.total_lease')}</span>
                                        <span>{formatPrice(totalLease)}</span>
                                    </div>
                                    <div className={styles.secondaryItem}>
                                        <span>{t('calculator.interest_rate_label')}</span>
                                        <span>5% {t('calculator.fixed')}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.comparisonFooter}>
                    <div className={styles.compareItem}>
                        <h4>{t('calculator.rent_month')}</h4>
                        <p>{formatPrice(activePreset.dailyRate * 30 * 0.8)}</p>
                    </div>
                    <div className={styles.compareItem}>
                         <h4>{t('calculator.lease_month')}</h4>
                         <p>{formatPrice((activePreset.carPrice * 0.7) / 36 + (activePreset.carPrice * 0.05 / 12))}</p>
                    </div>
                    <div className={styles.compareHint}>
                        {t('calculator.calc_hint')}
                    </div>
                </div>
            </div>
        </div>
    );
}
