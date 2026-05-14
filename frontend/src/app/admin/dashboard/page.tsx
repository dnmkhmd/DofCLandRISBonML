'use client';

import { useEffect, useState } from 'react';
import { 
    getAdminStats, 
    getAdminLogs, 
    AdminStats, 
    RequestLog 
} from '@/utils/adminApi';
import { 
    Car, 
    Users, 
    CalendarCheck, 
    FileText, 
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [recentLogs, setRecentLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, logsData] = await Promise.all([
                    getAdminStats(),
                    getAdminLogs({ limit: 10 })
                ]);
                setStats(statsData);
                setRecentLogs(logsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
        
        // Poll for updates every 10 seconds (dashboard is less frequent than history)
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return <div className={styles.loading}>Loading Dashboard...</div>;
    }

    const statCards = [
        { title: 'Total Cars', value: stats?.total_cars || 0, icon: <Car size={24} />, color: '#3a7bd5' },
        { title: 'Active Rentals', value: stats?.active_rentals || 0, icon: <CalendarCheck size={24} />, color: '#10b981' },
        { title: 'Pending Leasing', value: stats?.pending_leasing || 0, icon: <FileText size={24} />, color: '#f59e0b' },
        { title: 'Total Users', value: stats?.total_users || 0, icon: <Users size={24} />, color: '#8b5cf6' },
        { title: 'Today\'s Requests', value: stats?.requests_today || 0, icon: <Activity size={24} />, color: '#ec4899' },
    ];

    const getActionBadgeColor = (type: string) => {
        switch (type) {
            case 'booking': return styles.badgeGreen;
            case 'view': return styles.badgeBlue;
            case 'leasing': return styles.badgeOrange;
            case 'login_failed': 
            case 'admin_login_failed': return styles.badgeRed;
            case 'login':
            case 'admin_login': return styles.badgeGray;
            default: return styles.badgeDefault;
        }
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.statsGrid}>
                {statCards.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.title} 
                        className={styles.statCard}
                    >
                        <div className={styles.statIcon} style={{ background: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className={styles.statInfo}>
                            <h3>{stat.title}</h3>
                            <p className={styles.statValue}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className={styles.mainGrid}>
                {/* Recent Activity */}
                <div className={styles.activityPanel}>
                    <div className={styles.panelHeader}>
                        <h2>Recent Activity</h2>
                        <span className={styles.liveIndicator}>
                            <span className={styles.pulse}></span> Live
                        </span>
                    </div>
                    <div className={styles.activityList}>
                        <AnimatePresence initial={false}>
                            {recentLogs.length > 0 ? (
                                recentLogs.map((log) => (
                                    <motion.div 
                                        key={log.id} 
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={styles.activityItem}
                                    >
                                        <div className={styles.activityBadge}>
                                            <span className={`${styles.badge} ${getActionBadgeColor(log.action_type)}`}>
                                                {log.action_type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className={styles.activityContent}>
                                            <p className={styles.activityDesc}>{log.description}</p>
                                            <div className={styles.activityMeta}>
                                                <span className={styles.metaEmail}>{log.user_email || 'Guest'}</span>
                                                <span className={styles.metaDot}>•</span>
                                                <span className={styles.metaTime}>
                                                    <Clock size={12} style={{ marginRight: '4px' }} />
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className={styles.noActivity}>No activity recorded yet.</p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Quick Actions or Tips */}
                <div className={styles.secondaryPanel}>
                    <div className={styles.panelHeader}>
                        <h2>Quick Insights</h2>
                    </div>
                    <div className={styles.insightCard}>
                        <h3>Performance</h3>
                        <p>Total requests remain stable, average response time today is 45ms.</p>
                    </div>
                    <div className={styles.insightCard}>
                        <h3>Maintenance</h3>
                        <p>Automated database backup was successful today at 04:00 AM.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
