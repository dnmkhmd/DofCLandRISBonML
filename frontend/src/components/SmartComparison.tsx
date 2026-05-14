'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './SmartComparison.module.css';
import Button from './ui/Button';

export default function SmartComparison() {
    const { t } = useTranslation();

    const CATEGORIES = {
        budget: {
            name: t('calculator.budget'),
            description: t('calculator.budget_desc'),
            rentPriceDay: 25000,
            carPrice: 12000000,
            monthlyLeaseBase: 150000,
            image: '/images/comparison/budget.png'
        },
        premium: {
            name: t('calculator.premium'),
            description: t('calculator.premium_desc'),
            rentPriceDay: 75000,
            carPrice: 55000000,
            monthlyLeaseBase: 450000,
            image: 'images/cars/x5_3.webp'
        }
    };

    const [category, setCategory] = useState<'budget' | 'premium'>('budget');
    const [duration, setDuration] = useState(30); // days for rent
    const [leaseTerm, setLeaseTerm] = useState(36); // months for lease
    const [downPayment, setDownPayment] = useState(50000);
    const { formatPrice, getCurrencySymbol } = useCurrency();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <section className={styles.wrapper}><div className={styles.container}>{t('calculator.loading')}</div></section>;

    const data = CATEGORIES[category];

    // Rental Calculation
    const totalRent = duration * data.rentPriceDay;

    // Simplified Lease Calculation
    const monthlyLease = Math.max(0, (data.carPrice - downPayment) / leaseTerm + (data.carPrice * 0.05 / 12));
    const totalLease = (monthlyLease * leaseTerm) + downPayment;

    return (
        <section className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('calculator.title')} <span className={styles.highlight}>{t('calculator.highlight')}</span></h2>
                    <p className={styles.subtitle}>{t('calculator.subtitle')}</p>

                    <div className={styles.currencyToggle} style={{ opacity: 0.5, pointerEvents: 'none' }}>
                        {/* Global switcher in Navbar handles this now */}
                        <span>{getCurrencySymbol()}</span>
                    </div>
                </div>

                <div className={styles.grid}>
                    <div className={styles.controls}>
                        <div className={styles.controlGroup}>
                            <label className={styles.label}>{t('calculator.select_category')}</label>
                            <div className={styles.tabs}>
                                <button
                                    className={`${styles.tab} ${category === 'budget' ? styles.activeTab : ''}`}
                                    onClick={() => setCategory('budget')}
                                >
                                    {t('calculator.budget')}
                                </button>
                                <button
                                    className={`${styles.tab} ${category === 'premium' ? styles.activeTab : ''}`}
                                    onClick={() => setCategory('premium')}
                                >
                                    {t('calculator.premium')}
                                </button>
                            </div>
                        </div>

                        <p className={styles.description}>{data.description}</p>

                        <div className={styles.inputsGrid}>
                            <div className={styles.inputItem}>
                                <label className={styles.label}>{t('calculator.rent_duration')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    className={styles.input}
                                    value={duration || ''}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setDuration(isNaN(val) ? 0 : val);
                                    }}
                                />
                            </div>
                            <div className={styles.inputItem}>
                                <label className={styles.label}>{t('calculator.down_payment')}</label>
                                <input
                                    type="number"
                                    min="0"
                                    className={styles.input}
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.results}>
                        <div className={styles.resultCard}>
                            <div className={styles.resultHeader}>
                                <div className={styles.categoryImageWrapper}>
                                    <img src={data.image} alt={data.name} className={styles.categoryImage} />
                                </div>
                                <div className={styles.resultTitleGroup}>
                                    <span className={styles.resultIcon}>🚗</span>
                                    <h3>{t('calculator.short_term')}</h3>
                                </div>
                            </div>
                            <div className={styles.resultValue}>
                                {formatPrice(totalRent)}
                                <span className={styles.unit}>/ {duration} {t('calculator.days')}</span>
                            </div>
                            <div className={styles.resultMeta}>
                                {t('calculator.based_on')} {formatPrice(data.rentPriceDay)} / {t('calculator.per_day')}
                            </div>
                        </div>

                        <div className={`${styles.resultCard} ${styles.featuredCard}`}>
                            <div className={styles.resultHeader}>
                                <div className={styles.categoryImageWrapper}>
                                    <img src={data.image} alt={data.name} className={styles.categoryImage} />
                                </div>
                                <div className={styles.resultTitleGroup}>
                                    <span className={styles.resultIcon}>💎</span>
                                    <h3>{t('calculator.long_term')}</h3>
                                </div>
                            </div>
                            <div className={styles.resultValue}>
                                {formatPrice(monthlyLease)}
                                <span className={styles.unit}>/ {t('calculator.per_month')}</span>
                            </div>
                            <div className={styles.resultMeta}>
                                {t('calculator.total_cost')}: {formatPrice(totalLease)} {t('calculator.over')} {leaseTerm} {t('calculator.term_months')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
