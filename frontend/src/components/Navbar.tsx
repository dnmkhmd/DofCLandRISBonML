'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();

    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useTranslation();
    const { currency, setCurrency } = useCurrency();

    // Hide navbar only on admin pages
    const hideNavbar = pathname?.startsWith('/admin');
    if (hideNavbar) return null;

    const navItems = [
        { name: t('nav.catalog'), href: '/cars' },
        { name: t('nav.about'), href: '/about' },
        { name: t('nav.reviews'), href: '/reviews' },
        { name: t('nav.contacts'), href: '/contacts' },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    DCR<span>AI</span>
                </Link>

                <div className={styles.navLinks}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.link} ${pathname === item.href ? styles.linkActive : ''} flex items-center gap-2`}
                        >
                            {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
                            <span className={item.icon ? 'hidden md:inline' : ''}>{item.name}</span>
                        </Link>
                    ))}
                </div>

                <div className={styles.actions}>
                    <div className={styles.languageSwitcher}>
                        <button 
                            className={`${styles.langBtn} ${language === 'kz' ? styles.activeItem : ''}`}
                            onClick={() => setLanguage('kz')}
                        >
                            KZ
                        </button>
                        <button 
                            className={`${styles.langBtn} ${language === 'ru' ? styles.activeItem : ''}`}
                            onClick={() => setLanguage('ru')}
                        >
                            RU
                        </button>
                        <button 
                            className={`${styles.langBtn} ${language === 'en' ? styles.activeItem : ''}`}
                            onClick={() => setLanguage('en')}
                        >
                            EN
                        </button>
                    </div>

                    <div className={styles.currencySwitcher}>
                        <button 
                            className={`${styles.langBtn} ${currency === 'USD' ? styles.activeItem : ''}`}
                            onClick={() => setCurrency('USD')}
                        >
                            $
                        </button>
                        <button 
                            className={`${styles.langBtn} ${currency === 'KZT' ? styles.activeItem : ''}`}
                            onClick={() => setCurrency('KZT')}
                        >
                            ₸
                        </button>
                        <button 
                            className={`${styles.langBtn} ${currency === 'RUB' ? styles.activeItem : ''}`}
                            onClick={() => setCurrency('RUB')}
                        >
                            ₽
                        </button>
                    </div>



                    {!user && (
                        <Link href="/login" className={styles.link} style={{ fontWeight: 600 }}>{t('nav.login')}</Link>
                    )}
                    {user ? (
                        <Link href="/dashboard" className={styles.cta}>{t('nav.dashboard')}</Link>
                    ) : (
                        <Link href="/register" className={styles.cta}>{t('nav.register')}</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
