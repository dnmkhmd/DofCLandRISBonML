'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import api from '@/utils/api';
import Button from '@/components/ui/Button';
import { Car, ShoppingBag, User, Settings, LogOut, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language, setLanguage } = useTranslation();
    const { currency, setCurrency, formatPrice, getCurrencySymbol } = useCurrency();
    
    const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'history');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState({
        fullName: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                const res = await api.get(`/bookings/${user.id}`);
                setBookings(res.data.bookings || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, router]);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleDeleteAccount = () => {
        if (confirm(t('dashboard.delete') + '?')) {
            logout();
            router.push('/');
        }
    };

    const handleCancel = async (bookingId: number) => {
        if (confirm('Cancel this booking?')) {
            try {
                await api.put(`/bookings/${user.id}/${bookingId}/cancel`);
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {user.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className={styles.greeting}>
                            {t('dashboard.greeting')}, {user.full_name}!
                        </h1>
                        <p className={styles.email}>{user.email}</p>
                        <span className={styles.roleBadge}>
                            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </span>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {t('dashboard.tab.history')}
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User className="w-4 h-4 mr-2" />
                        {t('dashboard.tab.profile')}
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        {t('dashboard.tab.settings')}
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'history' && (
                        <div>
                            <h2 className={styles.sectionTitle}>{t('dashboard.tab.history')}</h2>
                            
                            {loading ? (
                                <p>Loading...</p>
                            ) : bookings.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Car className="w-12 h-12 mb-4 text-slate-500" />
                                    <p>{t('dashboard.empty')}</p>
                                    <Button onClick={() => router.push('/cars')} className="mt-4">
                                        {t('dashboard.empty.btn')}
                                    </Button>
                                </div>
                            ) : (
                                <div className={styles.bookingList}>
                                    {bookings.map(b => (
                                        <div key={b.id} className={styles.bookingCard}>
                                            <div className={styles.bookingImage}>
                                                <img src={b.car_photo || "/placeholder-car.jpg"} alt={b.car_brand} />
                                            </div>
                                            <div className={styles.bookingDetails}>
                                                <h3>{b.car_brand} {b.car_model}</h3>
                                                <p className={styles.bookingDate}>
                                                    {b.start_date} — {b.end_date}
                                                </p>
                                                <div className={styles.badges}>
                                                    <span className={b.booking_type === 'rent' ? styles.badgeRent : styles.badgeLease}>
                                                        {t(`dashboard.type.${b.booking_type}`)}
                                                    </span>
                                                    <span className={`${styles.badgeStatus} ${styles[`status_${b.status}`]}`}>
                                                        {t(`dashboard.status.${b.status}`)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={styles.bookingPrice}>
                                                <p className={styles.price}>{getCurrencySymbol()}{b.total_price}</p>
                                                {b.status === 'active' && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleCancel(b.id)}>
                                                        Отменить
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div>
                            <h2 className={styles.sectionTitle}>{t('dashboard.tab.profile')}</h2>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input className={styles.input} value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email (disabled)</label>
                                <input className={styles.input} disabled value={profileData.email} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone</label>
                                <input className={styles.input} value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                            </div>
                            <Button className="mt-4">Сохранить изменения</Button>

                            <div className="mt-12 border-t border-white/10 pt-8">
                                <h2 className={styles.sectionTitle}>Change Password</h2>
                                <div className={styles.formGroup}>
                                    <label>Current Password</label>
                                    <input type="password" className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>New Password</label>
                                    <input type="password" className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Confirm New Password</label>
                                    <input type="password" className={styles.input} />
                                </div>
                                <Button className="mt-4">Изменить пароль</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div>
                            <h2 className={styles.sectionTitle}>{t('dashboard.tab.settings')}</h2>
                            
                            <div className={styles.settingsGroup}>
                                <h3>Язык интерфейса</h3>
                                <div className={styles.toggleButtons}>
                                    <button className={`${styles.toggleBtn} ${language === 'kz' ? styles.toggleActive : ''}`} onClick={() => setLanguage('kz')}>KZ</button>
                                    <button className={`${styles.toggleBtn} ${language === 'ru' ? styles.toggleActive : ''}`} onClick={() => setLanguage('ru')}>RU</button>
                                    <button className={`${styles.toggleBtn} ${language === 'en' ? styles.toggleActive : ''}`} onClick={() => setLanguage('en')}>EN</button>
                                </div>
                            </div>

                            <div className={styles.settingsGroup}>
                                <h3>Валюта</h3>
                                <div className={styles.toggleButtons}>
                                    <button className={`${styles.toggleBtn} ${currency === 'KZT' ? styles.toggleActive : ''}`} onClick={() => setCurrency('KZT')}>₸</button>
                                    <button className={`${styles.toggleBtn} ${currency === 'USD' ? styles.toggleActive : ''}`} onClick={() => setCurrency('USD')}>$</button>
                                    <button className={`${styles.toggleBtn} ${currency === 'RUB' ? styles.toggleActive : ''}`} onClick={() => setCurrency('RUB')}>₽</button>
                                </div>
                            </div>

                            <div className={styles.settingsGroup}>
                                <h3>Уведомления</h3>
                                <label className={styles.checkboxLabel}>
                                    <input type="checkbox" defaultChecked /> Email уведомления
                                </label>
                                <label className={styles.checkboxLabel}>
                                    <input type="checkbox" defaultChecked /> SMS уведомления
                                </label>
                            </div>

                            <div className="mt-12 border-t border-red-500/20 pt-8">
                                <h3 className="text-red-400 font-medium mb-4">Danger Zone</h3>
                                <div className="flex flex-col gap-4 items-start">
                                    <button className={styles.dangerOutlineBtn} onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2 inline" />
                                        {t('dashboard.logout')}
                                    </button>
                                    <button className={styles.dangerBtn} onClick={handleDeleteAccount}>
                                        <AlertTriangle className="w-4 h-4 mr-2 inline" />
                                        {t('dashboard.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
