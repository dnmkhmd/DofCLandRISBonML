'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import styles from './page.module.css';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send, 
    CheckCircle2, 
    AlertCircle,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactsPage() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await api.post(`/contact`, formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (!mounted) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className={styles.title}>
                        {t('contacts_page.title')} <span className={styles.highlight}>{t('contacts_page.highlight')}</span>
                    </h1>
                </motion.div>

                <div className={styles.layout}>
                    <motion.aside 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={styles.infoCard}
                    >
                        <h2>{t('contacts_page.info_title')}</h2>
                        <p style={{ color: '#94a3b8', marginTop: '0.5rem', lineHeight: '1.6' }}>
                            {t('contacts_page.info_desc')}
                        </p>

                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <div className={styles.icon}>
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className={styles.infoContent}>
                                    <h4>{t('contacts_page.office_title')}</h4>
                                    <p>{t('contacts_page.office_val')}</p>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.icon}>
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div className={styles.infoContent}>
                                    <h4>{t('contacts_page.phone_title')}</h4>
                                    <p>{t('contacts_page.phone_val')}<br />{t('contacts_page.phone_sub')}</p>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.icon}>
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div className={styles.infoContent}>
                                    <h4>{t('contacts_page.email_title')}</h4>
                                    <p>{t('contacts_page.email_val')}<br />{t('contacts_page.email_sub')}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '1rem', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                            <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageSquare className="w-4 h-4 text-purple-400" />
                                {t('contacts_page.live_chat_title')}
                            </h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                {t('contacts_page.live_chat_desc')}
                            </p>
                        </div>
                    </motion.aside>

                    <motion.main 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className={styles.formCard}
                    >
                        <h2>{t('contacts_page.form_title')}</h2>
                        <form onSubmit={handleSubmit} className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>{t('contacts_page.label_name')}</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t('contacts_page.label_email')}</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    className={styles.input}
                                    value={formData.email}
                                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                            <div className={styles.inputGroup + " " + styles.fullWidth}>
                                <label>{t('contacts_page.label_phone')}</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+7 707 --- -- --"
                                    className={styles.input}
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                />
                            </div>
                            <div className={styles.inputGroup + " " + styles.fullWidth}>
                                <label>{t('contacts_page.label_message')}</label>
                                <textarea
                                    required
                                    placeholder={t('contacts_page.placeholder_message')}
                                    className={styles.textarea}
                                    value={formData.message}
                                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                />
                            </div>
                            <div className={styles.fullWidth}>
                                <Button
                                    type="submit"
                                    style={{ 
                                        width: '100%',
                                        height: '56px',
                                        backgroundColor: '#7c3aed',
                                        fontSize: '1.125rem',
                                        fontWeight: '700'
                                    }}
                                    isLoading={status === 'loading'}
                                >
                                    {status === 'success' ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span>{t('contacts_page.sent')}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Send className="w-5 h-5" />
                                            <span>{status === 'loading' ? t('contacts_page.sending') : t('contacts_page.submit')}</span>
                                        </div>
                                    )}
                                </Button>
                                
                                <AnimatePresence>
                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-center gap-2 text-red-400 mt-4 font-medium"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{t('contacts_page.error')}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>
                    </motion.main>
                </div>
            </div>
        </div>
    );
}
