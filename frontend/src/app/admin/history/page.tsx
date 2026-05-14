'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
    getAdminLogs, 
    clearAdminLogs, 
    exportAdminLogsUrl,
    RequestLog 
} from '@/utils/adminApi';
import { 
    Search, 
    Download, 
    Trash2, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    RefreshCw,
    ShieldAlert,
    User,
    Globe,
    Zap,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './history.module.css';

export default function RequestHistory() {
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    const fetchLogs = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const data = await getAdminLogs({ limit: 500 }); // Get more for client-side filtering
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(() => fetchLogs(), 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
            const matchesUser = !userFilter || (log.user_email && log.user_email.toLowerCase().includes(userFilter.toLowerCase()));
            return matchesSearch && matchesAction && matchesUser;
        });
    }, [logs, searchQuery, actionFilter, userFilter]);

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredLogs.slice(start, start + rowsPerPage);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

    const handleClearLogs = async () => {
        try {
            await clearAdminLogs();
            setLogs([]);
            setShowClearModal(false);
        } catch (error) {
            console.error("Failed to clear logs", error);
        }
    };

    const handleExport = () => {
        const token = localStorage.getItem('admin_token');
        window.open(`${exportAdminLogsUrl}?token=${token}`, '_blank');
    };

    const getActionBadgeColor = (type: string) => {
        switch (type) {
            case 'booking': return styles.badgeGreen;
            case 'view': return styles.badgeBlue;
            case 'leasing': return styles.badgeOrange;
            case 'registration': return styles.badgePurple;
            case 'login_failed': 
            case 'admin_login_failed': return styles.badgeRed;
            case 'login':
            case 'admin_login': return styles.badgeGray;
            default: return styles.badgeDefault;
        }
    };

    if (loading) return <div className={styles.loading}>Initializing log stream...</div>;

    return (
        <div className={styles.historyContainer}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by description..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <Filter size={16} />
                        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                            <option value="all">All Actions</option>
                            <option value="booking">Bookings</option>
                            <option value="leasing">Leasing</option>
                            <option value="view">Car Views</option>
                            <option value="login">Logins</option>
                            <option value="registration">Registrations</option>
                            <option value="contact">Contact Forms</option>
                        </select>
                    </div>
                    
                    <div className={styles.filterGroup}>
                        <User size={16} />
                        <input 
                            type="text" 
                            placeholder="Filter by user..." 
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.refreshBtn} onClick={() => fetchLogs(true)} disabled={refreshing}>
                        <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
                    </button>
                    <button className={styles.exportBtn} onClick={handleExport}>
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button className={styles.clearBtn} onClick={() => setShowClearModal(true)}>
                        <Trash2 size={18} />
                        <span>Clear All</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Timestamp</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>User</th>
                            <th>IP Address</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        <AnimatePresence mode="popLayout">
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log, index) => (
                                    <motion.tr 
                                        key={log.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <td className={styles.idCol}>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                        <td className={styles.timeCol}>
                                            <div className={styles.dateTime}>
                                                <span className={styles.date}>{new Date(log.created_at).toLocaleDateString()}</span>
                                                <span className={styles.time}>{new Date(log.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${getActionBadgeColor(log.action_type)}`}>
                                                {log.action_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className={styles.descCol}>{log.description}</td>
                                        <td className={styles.userCol}>
                                            <div className={styles.userCell}>
                                                {log.user_email === 'admin' ? <ShieldAlert size={14} className={styles.adminIcon} /> : <User size={14} />}
                                                <span>{log.user_email || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td className={styles.ipCol}>
                                            <div className={styles.ipCell}>
                                                <Globe size={14} />
                                                <span>{log.ip_address || 'unknown'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={log.status_code && log.status_code >= 400 ? styles.statusFail : styles.statusOk}>
                                                {log.status_code || 200}
                                            </span>
                                        </td>
                                        <td className={styles.latencyCol}>
                                            <div className={styles.latencyCell}>
                                                <Zap size={14} />
                                                <span>{log.response_time_ms}ms</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr className={styles.emptyState}>
                                    <td colSpan={8}>
                                        <div className={styles.emptyContent}>
                                            <Calendar size={48} />
                                            <p>No requests found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <p className={styles.pageInfo}>
                    Showing <b>{paginatedLogs.length}</b> of <b>{filteredLogs.length}</b> logs
                </p>
                <div className={styles.pageControls}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button 
                                key={page} 
                                className={currentPage === page ? styles.activePage : ''}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        );
                    })}
                    {totalPages > 5 && <span className={styles.ellipsis}>...</span>}
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Clear Modal */}
            <AnimatePresence>
                {showClearModal && (
                    <div className={styles.modalOverlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={styles.modal}
                        >
                            <h3>Clear Request History?</h3>
                            <p>This action will permanently delete all activity logs from the database. This cannot be undone.</p>
                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={() => setShowClearModal(false)}>Cancel</button>
                                <button className={styles.confirmBtn} onClick={handleClearLogs}>Delete All Logs</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
