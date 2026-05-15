'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './Navbar.module.css';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();

    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useTranslation();
    const { currency, setCurrency } = useCurrency();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    {!user && (
                        <Link href="/register" className={styles.cta}>{t('nav.register')}</Link>
                    )}
                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <div 
                                className="flex items-center gap-2 cursor-pointer select-none"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-white font-medium hidden md:block">
                                    {user.full_name?.split(' ')[0] || 'User'}
                                </span>
                                {user.role === 'admin' && (
                                    <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30">Admin</span>
                                )}
                            </div>
                            
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl py-2 z-50 overflow-hidden" style={{right: 0}}>
                                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                                        Мой профиль
                                    </Link>
                                    <Link href="/dashboard?tab=history" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                                        История покупок
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                                            Панель администратора
                                        </Link>
                                    )}
                                    <div className="border-t border-white/10 my-1"></div>
                                    <button 
                                        onClick={() => {
                                            logout();
                                            setDropdownOpen(false);
                                            window.location.href = '/';
                                        }}
                                        className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        Выйти
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
