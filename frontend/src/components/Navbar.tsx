import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    AutoLease AI
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/cars" className={styles.link}>
                        Browse Cars
                    </Link>
                    <Link href="/predict" className={styles.link}>
                        Price Predictor
                    </Link>
                    <Link href="/admin" className={styles.link}>
                        Admin
                    </Link>
                </div>
                <Link href="/login" className={styles.cta}>
                    Sign In
                </Link>
            </div>
        </nav>
    );
}
