'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const hideFooter = pathname?.startsWith('/admin');
    if (hideFooter) return null;

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <Link href="/" className={styles.logo}>
                            DiarRentCar<span>AI</span>
                        </Link>
                        <p className={styles.description}>
                            {t('footer.description')}
                        </p>
                    </div>

                    <div className={styles.column}>
                        <h3>{t('footer.platform')}</h3>
                        <ul className={styles.links}>
                            <li><Link href="/rent" className={styles.link}>{t('footer.rent')}</Link></li>
                            <li><Link href="/leasing" className={styles.link}>{t('footer.leasing')}</Link></li>
                            <li><Link href="/predict" className={styles.link}>{t('footer.predictor')}</Link></li>
                            <li><Link href="/models" className={styles.link}>{t('nav.models')}</Link></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>{t('footer.company')}</h3>
                        <ul className={styles.links}>
                            <li><Link href="/about" className={styles.link}>{t('footer.about')}</Link></li>
                            <li><Link href="/reviews" className={styles.link}>{t('footer.reviews')}</Link></li>
                            <li><Link href="/contacts" className={styles.link}>{t('footer.contact')}</Link></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>{t('footer.legal')}</h3>
                        <ul className={styles.links}>
                            <li><Link href="/privacy" className={styles.link}>{t('footer.privacy')}</Link></li>
                            <li><Link href="/terms" className={styles.link}>{t('footer.terms')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} DiarRentCar AI. {t('footer.rights')}
                    </p>
                    <div className={styles.socials}>
                        <Link href="https://wa.me/+77711352140" className={styles.socialIcon}>{t('footer.whatsapp')}</Link>
                        <Link href="https://t.me/zdikonaprimer1" className={styles.socialIcon}>{t('footer.telegram')}</Link>
                        <Link href="https://www.instagram.com/1tolegenovich?igsh=cGFoYmx6N2pqbmZw" className={styles.socialIcon}>{t('footer.instagram')}</Link>
                        <Link href="https://2gis.kz/astana/search/Проспект%20Туран%2C%2044а/firm/70000001044911791/71.400971%2C51.11367?m=71.400971%2C51.11367%2F17.78" className={styles.socialIcon}>{t('footer.2gis')}</Link>
                        <Link href="https://www.google.com/maps/place/просп.+Туран+44,+Астана+010000/@51.1135139,71.401069,17z/data=!3m1!4b1!4m6!3m5!1s0x42458432ac2fcf95:0x7d1faeb14e888284!8m2!3d51.1135139!4d71.401069!16s%2Fg%2F11s7qsw3t8?entry=ttu&g_ep=EgoyMDI2MDQwNS4wIKXMDSoASAFQAw%3D%3D" className={styles.socialIcon}>{t('footer.google_maps')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
