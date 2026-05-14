'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Car,
    CalendarCheck,
    FileText,
    Users,
    History,
    Settings,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';
import styles from './layout.module.css';

const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
    { title: 'Cars Management', icon: <Car size={20} />, href: '/admin/cars' },
    { title: 'Bookings', icon: <CalendarCheck size={20} />, href: '/admin/bookings' },
    { title: 'Leasing Applications', icon: <FileText size={20} />, href: '/admin/leasing' },
    { title: 'Users', icon: <Users size={20} />, href: '/admin/users' },
    { title: 'Request History', icon: <History size={20} />, href: '/admin/history' },
    { title: 'Settings', icon: <Settings size={20} />, href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token && !isLoginPage) {
            router.push('/admin/login');
        } else if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, [pathname, isLoginPage, router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    if (loading) return null;

    // Don't show sidebar on login page
    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <span className={styles.logoText}>DiarRentCar <span className={styles.logoHighlight}>AI</span></span>
                    </div>
                    <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        {!sidebarOpen && (
                            <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)}>
                                <Menu size={24} />
                            </button>
                        )}
                        <h2 className={styles.pageTitle}>
                            {menuItems.find(item => item.href === pathname)?.title || 'Admin Panel'}
                        </h2>
                    </div>
                    <div className={styles.headerRight}>
                        <button className={styles.iconBtn}><Bell size={20} /></button>
                        <div className={styles.userProfile}>
                            <div className={styles.avatar}>A</div>
                            <span className={styles.userName}>Administrator</span>
                        </div>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
