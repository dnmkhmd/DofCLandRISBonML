'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import styles from './page.module.css';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';

interface Review {
    id: number;
    author_name: string;
    rating: number;
    text: string;
    date: string;
    avatar?: string;
}

export default function ReviewsPage() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        author_name: '',
        rating: 5,
        text: ''
    });

    const fetchReviews = async () => {
        try {
            const res = await api.get('/reviews');
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                ...formData,
                date: new Date().toISOString().split('T')[0]
            });
            setFormData({ author_name: '', rating: 5, text: '' });
            fetchReviews();
        } catch (err) {
            console.error("Failed to submit review", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}><div className="loader"></div></div>;

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>{t('reviews_page.title')} <span className={styles.highlight}>{t('reviews_page.highlight')}</span></h1>

                <div className={styles.reviewGrid}>
                    {reviews.map(review => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.avatar}>
                                    {review.avatar ? <img src={review.avatar} alt="" /> : review.author_name[0]}
                                </div>
                                <div className={styles.authorInfo}>
                                    <h4>{review.author_name}</h4>
                                    <div className={styles.rating}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                            </div>
                            <p className={styles.text}>"{review.text}"</p>
                            <span className={styles.date}>{review.date}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.formSection}>
                    <h2 style={{ textAlign: 'center', fontSize: '1.5rem' }}>{t('reviews_page.leave_title')} <span className={styles.highlight}>{t('reviews_page.leave_highlight')}</span></h2>
                    <form onSubmit={handleSubmit} className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>{t('contacts_page.label_name')}</label>
                            <input 
                                type="text" 
                                required 
                                className={styles.input} 
                                value={formData.author_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                placeholder="Your name"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{t('reviews_page.label_rating')}</label>
                            <select 
                                className={styles.select}
                                value={formData.rating}
                                onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                            >
                                <option value={5}>{t('reviews_page.stars_5')}</option>
                                <option value={4}>{t('reviews_page.stars_4')}</option>
                                <option value={3}>{t('reviews_page.stars_3')}</option>
                                <option value={2}>{t('reviews_page.stars_2')}</option>
                                <option value={1}>{t('reviews_page.stars_1')}</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{t('reviews_page.label_experience')}</label>
                            <textarea 
                                required 
                                className={styles.textarea}
                                value={formData.text}
                                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                                placeholder={t('reviews_page.placeholder_experience')}
                            />
                        </div>
                        <Button type="submit" disabled={submitting} isLoading={submitting} size="lg">
                            {t('reviews_page.submit')}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
