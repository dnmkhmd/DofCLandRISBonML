'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import Button from './ui/Button';
import styles from '../app/cars/page.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { Car } from '@/utils/api';

interface RentalCalculatorProps {
    car: Car;
    onClose: () => void;
}

export default function RentalCalculator({ car, onClose }: RentalCalculatorProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'rent' | 'lease'>('rent');
    
    // Rent State
    const [dates, setDates] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });
    
    const [options, setOptions] = useState({
        insurance: true,
        gps: false,
        child_seat: false
    });

    const [rentResult, setRentResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { formatPrice, getCurrencySymbol } = useCurrency();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Lease State
    const [leaseParams, setLeaseParams] = useState({
        downPayment: Math.round(car.rent_price_month * 6),
        interestRate: 0.05,
        term: 36,
        residualPercent: 50
    });

    const calculateRent = async () => {
        setLoading(true);
        try {
            const response = await api.post('/calculate/rent', {
                car_id: car.id,
                start_date: dates.start,
                end_date: dates.end,
                ...options
            });
            setRentResult(response.data);
        } catch (error) {
            console.error("Calculation failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'rent') calculateRent();
    }, [dates, options, activeTab]);

    // Lease Calculation
    const calculateLease = () => {
        // Assume base price is 48 times the monthly rent if not explicitly provided
        const basePrice = car.rent_price_month * 48; 
        
        const { downPayment, interestRate, term, residualPercent } = leaseParams;
        const residualValue = basePrice * (residualPercent / 100);
        
        const depreciationFee = (basePrice - downPayment - residualValue) / term;
        const interestFee = (basePrice * interestRate) / 12;
        
        const monthlyPayment = Math.max(0, depreciationFee + interestFee);
        const totalCost = (monthlyPayment * term) + downPayment;
        
        return {
            monthlyPayment,
            totalCost,
            downPayment,
            term,
            residualValue
        };
    };

    const leaseResult = calculateLease();

    return (
        <div className={styles.calculatorModal} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.calcContent}>
                <div className={styles.calcHeader}>
                    <h2>{car.brand} <span>{car.model}</span></h2>
                    <Button variant="ghost" onClick={onClose} style={{ fontSize: '1.5rem', padding: '0.5rem' }}>✕</Button>
                </div>

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'rent' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('rent')}
                    >
                        {t('calc.rent')}
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'lease' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('lease')}
                    >
                        {t('calc.lease')}
                    </button>

                    <div className={styles.currencyToggle} style={{ marginLeft: 'auto', alignSelf: 'center', opacity: 0.5, pointerEvents: 'none' }}>
                        {/* Global switcher in Navbar handles this now */}
                        <span>{getCurrencySymbol()}</span>
                    </div>
                </div>

                {activeTab === 'rent' ? (
                    <div className={styles.calcGrid}>
                        <div className={styles.formGrid}>
                            <div className={styles.calcItem}>
                                <label>{t('calc.start_date')}</label>
                                <input 
                                    type="date" 
                                    className={styles.input}
                                    value={dates.start}
                                    onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
                                />
                            </div>
                            <div className={styles.calcItem}>
                                <label>{t('calc.end_date')}</label>
                                <input 
                                    type="date" 
                                    className={styles.input}
                                    value={dates.end}
                                    onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className={styles.options}>
                            <label className={styles.option}>
                                <input 
                                    type="checkbox" 
                                    checked={options.insurance}
                                    onChange={(e) => setOptions(prev => ({ ...prev, insurance: e.target.checked }))}
                                />
                                {t('calc.insurance')} (+{formatPrice(2500)}/{t('calc.days')})
                            </label>
                            <label className={styles.option}>
                                <input 
                                    type="checkbox" 
                                    checked={options.gps}
                                    onChange={(e) => setOptions(prev => ({ ...prev, gps: e.target.checked }))}
                                />
                                {t('calc.gps')} (+{formatPrice(1500)}/{t('calc.days')})
                            </label>
                            <label className={styles.option}>
                                <input 
                                    type="checkbox" 
                                    checked={options.child_seat}
                                    onChange={(e) => setOptions(prev => ({ ...prev, child_seat: e.target.checked }))}
                                />
                                {t('calc.child_seat')} (+{formatPrice(1000)}/{t('calc.days')})
                            </label>
                        </div>

                        {rentResult && (
                            <div className={styles.summary}>
                                <div className={styles.summaryRow}>
                                    <span>{t('calc.duration')}</span>
                                    <span>{rentResult.months} {t('calc.months')}, {rentResult.days} {t('calc.days')}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span>{t('calc.total')}</span>
                                    <span>{formatPrice(rentResult.total_cost)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.calcGrid}>
                        <div className={styles.formGrid}>
                            <div className={styles.calcItem}>
                                <label>{t('calc.down_payment')} ({getCurrencySymbol()})</label>
                                <input 
                                    type="number" 
                                    className={styles.input}
                                    value={leaseParams.downPayment}
                                    onChange={(e) => setLeaseParams(prev => ({ ...prev, downPayment: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className={styles.calcItem}>
                                <label>{t('calc.term')}</label>
                                <select 
                                    className={styles.select}
                                    value={leaseParams.term}
                                    onChange={(e) => setLeaseParams(prev => ({ ...prev, term: parseInt(e.target.value) }))}
                                >
                                    <option value="12">12 {t('calc.months')}</option>
                                    <option value="24">24 {t('calc.months')}</option>
                                    <option value="36">36 {t('calc.months')}</option>
                                    <option value="48">48 {t('calc.months')}</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.calcItem}>
                                <label>{t('calc.interest')}</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    className={styles.input}
                                    value={leaseParams.interestRate * 100}
                                    onChange={(e) => setLeaseParams(prev => ({ ...prev, interestRate: (parseFloat(e.target.value) || 0) / 100 }))}
                                />
                            </div>
                            <div className={styles.calcItem}>
                                <label>{t('calc.residual')}</label>
                                <input 
                                    type="number" 
                                    className={styles.input}
                                    value={leaseParams.residualPercent}
                                    onChange={(e) => setLeaseParams(prev => ({ ...prev, residualPercent: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>

                        <div className={styles.highlightBlock}>
                            <div className={styles.highlightLabel}>{t('calc.est_payment')}</div>
                            <div className={styles.highlightValue}>{formatPrice(leaseResult.monthlyPayment)}</div>
                        </div>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>{t('calc.total_cost')}</span>
                                <span>{formatPrice(leaseResult.totalCost)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>{t('calc.residual_val')}</span>
                                <span>{formatPrice(leaseResult.residualValue)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '2rem' }}>
                    <Button style={{ width: '100%' }} size="lg" disabled={loading} onClick={async () => {
                        if (!user) {
                            router.push('/login');
                            return;
                        }
                        setLoading(true);
                        try {
                            const totalPrice = activeTab === 'rent' ? rentResult?.total_cost : leaseResult?.totalCost;
                            let end_date_calc = dates.end;
                            if (activeTab === 'lease') {
                                const date = new Date();
                                date.setMonth(date.getMonth() + leaseParams.term);
                                end_date_calc = date.toISOString().split('T')[0];
                            }
                            await api.post('/bookings', {
                                user_id: user.id,
                                car_id: car.id,
                                car_brand: car.brand,
                                car_model: car.model,
                                car_photo: car.photos && car.photos.length > 0 ? car.photos[0] : "",
                                booking_type: activeTab,
                                start_date: activeTab === 'rent' ? dates.start : new Date().toISOString().split('T')[0],
                                end_date: end_date_calc,
                                total_price: totalPrice
                            });
                            alert('Бронирование добавлено!');
                            onClose();
                            router.push('/dashboard?tab=history');
                        } catch (error) {
                            console.error(error);
                            alert('Failed to book car');
                        } finally {
                            setLoading(false);
                        }
                    }}>
                        {loading ? t('calc.processing') : activeTab === 'rent' ? t('calc.confirm_rent') : t('calc.apply_lease')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
