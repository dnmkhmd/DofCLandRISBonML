'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/utils/adminApi';
import styles from './login.module.css';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if already logged in
        if (localStorage.getItem('admin_token')) {
            router.push('/admin/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminLogin(username, password);
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.logo}>
                    <span className={styles.logoText}>DiarRentCar <span className={styles.logoHighlight}>Admin</span></span>
                </div>
                <h1 className={styles.title}>Secure Access</h1>
                <p className={styles.subtitle}>Enter your credentials to access the admin panel</p>

                {error && <div className={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>© 2026 DCR AI System</p>
                </div>
            </div>
        </div>
    );
}
