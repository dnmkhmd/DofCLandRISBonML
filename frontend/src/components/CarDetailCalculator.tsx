'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

export default function CarDetailCalculator({ car }: { car: any }) {
    const [activeTab, setActiveTab] = useState<'rent' | 'leasing'>('rent');
    const { user, token } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const { formatPrice, getCurrencySymbol } = useCurrency();

    // Promo Code State
    const [promoInput, setPromoInput] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0); // e.g. 0.1 for 10%
    const [promoStatus, setPromoStatus] = useState<'none' | 'success' | 'error'>('none');

    // Rent State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [insurance, setInsurance] = useState(false);
    const [gps, setGps] = useState(false);
    const [childSeat, setChildSeat] = useState(false);
    const [rentBreakdown, setRentBreakdown] = useState<any>(null);

    // Leasing State
    const [carPrice, setCarPrice] = useState(car.leasing_price || 0);
    const [downPaymentPct, setDownPaymentPct] = useState(20);
    const [downPayment, setDownPayment] = useState(Math.round((car.leasing_price || 0) * 0.2));
    const [leaseTerm, setLeaseTerm] = useState(36);
    const [interestRate, setInterestRate] = useState(5.0);
    const [leasingBreakdown, setLeasingBreakdown] = useState<any>(null);
    const [showSchedule, setShowSchedule] = useState(false);

    // Rent Calculation
    useEffect(() => {
        if (!startDate || !endDate) {
            setRentBreakdown(null);
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            setRentBreakdown({ error: t('calculator.error_date') });
            return;
        }

        const timeDiff = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        const subtotal = days * car.rent_price_day;
        const insCost = insurance ? subtotal * 0.15 : 0; 
        const gpsCost = gps ? days * 10 : 0;
        const seatCost = childSeat ? days * 5 : 0;
        const total = subtotal + insCost + gpsCost + seatCost;
        const discountedTotal = total * (1 - promoDiscount);

        setRentBreakdown({ days, subtotal, insCost, gpsCost, seatCost, originalTotal: total, total: discountedTotal });
    }, [startDate, endDate, insurance, gps, childSeat, car.rent_price_day, t, promoDiscount]);

    // Leasing Calculation
    useEffect(() => {
        const discountedCarPrice = carPrice * (1 - promoDiscount);
        const P = discountedCarPrice - downPayment;
        const r = (interestRate / 100) / 12;
        const n = leaseTerm;

        let M = 0;
        if (r > 0) {
            M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        } else {
            M = P / n;
        }

        const totalPayment = (M * n) + downPayment;
        const totalOverpayment = totalPayment - discountedCarPrice;

        setLeasingBreakdown({
            loanAmount: P,
            monthlyPayment: isNaN(M) || !isFinite(M) ? 0 : M,
            totalPayment: isNaN(totalPayment) || !isFinite(totalPayment) ? 0 : totalPayment,
            totalOverpayment: isNaN(totalOverpayment) || !isFinite(totalOverpayment) ? 0 : totalOverpayment,
            originalCarPrice: carPrice,
            discountedCarPrice: discountedCarPrice
        });
    }, [carPrice, downPayment, leaseTerm, interestRate, promoDiscount]);

    const handleDownPaymentChange = (val: number) => {
        setDownPayment(val);
        setDownPaymentPct((val / carPrice) * 100);
    };

    const handleDownPctChange = (pct: number) => {
        setDownPaymentPct(pct);
        setDownPayment((pct / 100) * carPrice);
    };

    const handleApplyPromo = () => {
        const code = promoInput.toUpperCase().trim();
        if (code === 'WELCOME10') {
            setPromoDiscount(0.10);
            setPromoStatus('success');
        } else if (code === 'VIP20') {
            setPromoDiscount(0.20);
            setPromoStatus('success');
        } else {
            setPromoDiscount(0);
            setPromoStatus('error');
        }
    };

    const handleRentBooking = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!rentBreakdown || rentBreakdown.error) return;

        try {
            await api.post('/bookings', {
                car_id: car.id,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                type: 'rent',
                total_price: rentBreakdown.total
            });
            setMessage(t('calculator.booked_success'));
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch(err) {
            setMessage(t('calculator.failed'));
        }
    };

    const handleLeasingApp = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!leasingBreakdown) return;

        try {
            await api.post('/leasing', {
                car_id: car.id,
                down_payment: downPayment,
                term_months: leaseTerm,
                monthly_payment: leasingBreakdown.monthlyPayment
            });
            setMessage(t('calculator.applied_success'));
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch(err) {
            setMessage(t('calculator.failed'));
        }
    };

    return (
        <div style={{ marginTop: '4rem', padding: '2rem', background: 'hsl(var(--card))', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>{t('calculator.payment_options')}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', background: 'hsl(var(--muted))', borderRadius: '12px', padding: '0.5rem', gap: '0.5rem' }}>
                    <button 
                        onClick={() => setActiveTab('rent')}
                        style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: activeTab === 'rent' ? 'hsl(var(--background))' : 'transparent', color: activeTab === 'rent' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', transition: 'all 0.3s' }}
                    >
                        {t('calculator.rent')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('leasing')}
                        style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: activeTab === 'leasing' ? 'hsl(var(--background))' : 'transparent', color: activeTab === 'leasing' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', transition: 'all 0.3s' }}
                    >
                        {t('calculator.leasing')}
                    </button>
                </div>
            </div>

            {message && <div style={{ padding: '1rem', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>{message}</div>}

            <AnimatePresence mode='wait'>
                {activeTab === 'rent' ? (
                    <motion.div key="rent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>{t('calculator.start_date')}</label>
                                    <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('calculator.end_date')}</label>
                                    <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="checkbox" checked={insurance} onChange={e=>setInsurance(e.target.checked)} /> {t('calculator.insurance_pkg')}
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="checkbox" checked={gps} onChange={e=>setGps(e.target.checked)} /> {t('calculator.gps')} (+{formatPrice(2000)}/{t('predict.per_day')})
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="checkbox" checked={childSeat} onChange={e=>setChildSeat(e.target.checked)} /> {t('calculator.child_seat')} (+{formatPrice(1500)}/{t('predict.per_day')})
                                    </label>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={labelStyle}>Promo Code</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" placeholder="e.g. WELCOME10" value={promoInput} onChange={e=>setPromoInput(e.target.value)} style={inputStyle} />
                                        <button onClick={handleApplyPromo} style={{ padding: '0 1rem', background: 'hsl(var(--primary))', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
                                    </div>
                                    {promoStatus === 'success' && <div style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: '0.25rem' }}>Promo block applied successfully!</div>}
                                    {promoStatus === 'error' && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>Invalid or expired code</div>}
                                </div>
                            </div>

                            <div style={{ background: 'hsl(var(--muted))', padding: '1.5rem', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('calculator.summary')}</h3>
                                {rentBreakdown?.error ? (
                                    <div style={{ color: 'red' }}>{rentBreakdown.error}</div>
                                ) : rentBreakdown ? (
                                    <>
                                        <ListRow label={t('calculator.days')} value={rentBreakdown.days} />
                                        <ListRow label={t('calculator.price_per_day')} value={formatPrice(car.rent_price_day)} />
                                        <ListRow label={t('calculator.subtotal')} value={formatPrice(rentBreakdown.subtotal)} />
                                        {insurance && <ListRow label={t('calculator.insurance_pkg')} value={`+${formatPrice(rentBreakdown.insCost)}`} />}
                                        {gps && <ListRow label={t('calculator.gps')} value={`+${formatPrice(rentBreakdown.gpsCost)}`} />}
                                        {childSeat && <ListRow label={t('calculator.child_seat')} value={`+${formatPrice(rentBreakdown.seatCost)}`} />}
                                        
                                        <div style={{ margin: '1rem 0', borderTop: '1px solid hsl(var(--border))' }} />
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700 }}>
                                            <span>{t('calculator.total')}</span>
                                            <div style={{ textAlign: 'right' }}>
                                                {promoDiscount > 0 && (
                                                    <span style={{ display: 'block', fontSize: '1rem', textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))' }}>
                                                        {formatPrice(rentBreakdown.originalTotal)}
                                                    </span>
                                                )}
                                                <span style={{ color: promoDiscount > 0 ? '#4ade80' : 'inherit' }}>{formatPrice(rentBreakdown.total)}</span>
                                            </div>
                                        </div>

                                        <Button size="lg" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleRentBooking}>
                                            {user ? t('calculator.book_now') : t('calculator.login_to_book')}
                                        </Button>
                                    </>
                                ) : (
                                    <div style={{ color: 'hsl(var(--muted-foreground))' }}>{t('calculator.select_dates')}</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="leasing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>{t('predict.model')} {t('predict.est_value')} ({getCurrencySymbol()})</label>
                                    <input type="number" value={carPrice} onChange={e=>setCarPrice(Number(e.target.value))} style={inputStyle} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={labelStyle}>{t('calculator.down_payment')}: {downPaymentPct.toFixed(0)}%</label>
                                        <span style={{ fontWeight: 600 }}>{formatPrice(downPayment)}</span>
                                    </div>
                                    <input type="range" min="0" max="50" value={downPaymentPct} onChange={e=>handleDownPctChange(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem' }} />
                                    <input type="number" value={downPayment} onChange={e=>handleDownPaymentChange(Number(e.target.value))} style={{...inputStyle, marginTop: '0.5rem'}} />
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('calculator.term')} ({t('calculator.term_months')})</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {[12, 24, 36, 48].map(term => (
                                            <button key={term} onClick={()=>setLeaseTerm(term)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: leaseTerm === term ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))', background: leaseTerm === term ? 'hsl(var(--primary)/0.1)' : 'transparent', cursor: 'pointer', fontWeight: 600 }}>{term}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('calculator.annual_interest')}</label>
                                    <input type="number" step="0.1" value={interestRate} onChange={e=>setInterestRate(Number(e.target.value))} style={inputStyle} />
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={labelStyle}>Promo Code</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" placeholder="e.g. WELCOME10" value={promoInput} onChange={e=>setPromoInput(e.target.value)} style={inputStyle} />
                                        <button onClick={handleApplyPromo} style={{ padding: '0 1rem', background: 'hsl(var(--primary))', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
                                    </div>
                                    {promoStatus === 'success' && <div style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: '0.25rem' }}>Promo block applied successfully!</div>}
                                    {promoStatus === 'error' && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>Invalid or expired code</div>}
                                </div>
                            </div>

                            <div style={{ background: 'hsl(var(--muted))', padding: '1.5rem', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('calculator.summary')}</h3>
                                {leasingBreakdown && (
                                    <>
                                        {promoDiscount > 0 && <ListRow label="Discounted Car Price" value={formatPrice(leasingBreakdown.discountedCarPrice)} />}
                                        <ListRow label={t('calculator.loan_amount')} value={formatPrice(leasingBreakdown.loanAmount)} />
                                        <ListRow label={t('calculator.total_overpayment')} value={formatPrice(leasingBreakdown.totalOverpayment)} />
                                        <ListRow label={t('calculator.total_cost')} value={formatPrice(leasingBreakdown.totalPayment)} />
                                        
                                        <div style={{ margin: '1rem 0', borderTop: '1px solid hsl(var(--border))' }} />
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700 }}>
                                            <span>{t('calculator.monthly_payment')}</span>
                                            <span style={{ color: promoDiscount > 0 ? '#4ade80' : 'inherit' }}>{formatPrice(leasingBreakdown.monthlyPayment)}</span>
                                        </div>

                                        <Button size="lg" style={{ width: '100%', marginTop: '1.5rem', marginBottom: '1rem' }} onClick={handleLeasingApp}>
                                            {user ? t('car_detail.leasing_btn') : t('calculator.login_to_book')}
                                        </Button>

                                        <div style={{ textAlign: 'center' }}>
                                            <button onClick={()=>setShowSchedule(!showSchedule)} style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontSize: '0.875rem' }}>
                                                {showSchedule ? t('calculator.hide_schedule') : t('calculator.show_schedule')}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {showSchedule && leasingBreakdown && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '2rem', overflow: 'hidden' }}>
                                <h3 style={{ marginBottom: '1rem' }}>{t('calculator.amortization')}</h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'hsl(var(--muted))' }}>
                                                <th style={thStyle}>{t('calculator.month')}</th>
                                                <th style={thStyle}>{t('calculator.payment')}</th>
                                                <th style={thStyle}>{t('calculator.principal')}</th>
                                                <th style={thStyle}>{t('calculator.interest')}</th>
                                                <th style={thStyle}>{t('calculator.balance')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: Math.min(leaseTerm, 12) }).map((_, i) => {
                                                const P = leasingBreakdown.loanAmount;
                                                const r = (interestRate / 100) / 12;
                                                const PMT = leasingBreakdown.monthlyPayment;
                                                const intPaid = (P - (PMT * i)) * r; 
                                                const prinPaid = PMT - intPaid;
                                                return (
                                                    <tr key={i} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                                        <td style={tdStyle}>{i + 1}</td>
                                                        <td style={tdStyle}>{formatPrice(PMT)}</td>
                                                        <td style={tdStyle}>{formatPrice(prinPaid)}</td>
                                                        <td style={tdStyle}>{formatPrice(intPaid)}</td>
                                                        <td style={tdStyle}>{formatPrice(P - prinPaid * (i + 1))}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {leaseTerm > 12 && <div style={{ textAlign: 'center', padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>Showing first 12 months for brevity.</div>}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' };
const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' };
const thStyle = { padding: '0.75rem', fontWeight: 600, borderBottom: '2px solid hsl(var(--border))' };
const tdStyle = { padding: '0.75rem' };

function ListRow({ label, value }: { label: string, value: string | number }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
        </div>
    );
}
