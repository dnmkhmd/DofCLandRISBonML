'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Button from './ui/Button';
import styles from '../app/rent/page.module.css';

export default function LeasingCalculator() {
    const [params, setParams] = useState({
        car_price: 45000,
        down_payment: 5000,
        term_months: 36,
        interest_rate: 4.5
    });

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        setLoading(true);
        try {
            const response = await api.post('/calculate/leasing', params);
            setResult(response.data);
        } catch (error) {
            console.error("Leasing calculation failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(calculate, 300);
        return () => clearTimeout(timer);
    }, [params]);

    return (
        <div className={styles.filters} style={{ position: 'static', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.calcItem}>
                        <label>Vehicle Price ($)</label>
                        <input 
                            type="number" 
                            className={styles.input}
                            value={params.car_price}
                            onChange={(e) => setParams(prev => ({ ...prev, car_price: Number(e.target.value) }))}
                        />
                    </div>
                    <div className={styles.calcItem}>
                        <label>Down Payment ($)</label>
                        <input 
                            type="number" 
                            className={styles.input}
                            value={params.down_payment}
                            onChange={(e) => setParams(prev => ({ ...prev, down_payment: Number(e.target.value) }))}
                        />
                    </div>
                    <div className={styles.calcItem}>
                        <label>Term (Months)</label>
                        <select 
                            className={styles.select}
                            value={params.term_months}
                            onChange={(e) => setParams(prev => ({ ...prev, term_months: Number(e.target.value) }))}
                        >
                            <option value={12}>12 Months</option>
                            <option value={24}>24 Months</option>
                            <option value={36}>36 Months</option>
                            <option value={48}>48 Months</option>
                            <option value={60}>60 Months</option>
                        </select>
                    </div>
                </div>

                <div className={styles.summary} style={{ border: 'none', padding: '1.5rem', background: 'hsl(var(--muted)/0.3)', borderRadius: '1rem' }}>
                   {result && (
                       <>
                        <div className={styles.summaryRow}>
                            <span>Monthly Payment</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'hsl(var(--primary))' }}>
                                ${result.monthly_payment.toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Total Cost</span>
                            <span>${result.total_cost.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Total Interest</span>
                            <span>${result.total_overpayment.toLocaleString()}</span>
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                             <Button style={{ width: '100%' }}>Apply for Leasing</Button>
                        </div>
                       </>
                   )}
                </div>
            </div>
        </div>
    );
}
