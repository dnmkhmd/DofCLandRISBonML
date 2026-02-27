import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>
            Drive Your Dream Car with <span className={styles.highlight}>AI Precision</span>
          </h1>
          <p className={styles.subtitle}>
            Experience the future of car leasing. Our machine learning algorithms find the best prices and cars tailored just for you.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/cars" className={styles.primaryBtn}>
              Browse Inventory
            </Link>
            <Link href="/predict" className={styles.secondaryBtn}>
              Estimate Price
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose AutoLease AI?</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>Smart Pricing</h3>
              <p>Real-time market analysis ensures you get the fairest leasing rates based on demand and car condition.</p>
            </div>
            <div className={styles.card}>
              <h3>Personalized Matches</h3>
              <p>Our recommendation engine suggests vehicles that match your lifestyle and driving habits.</p>
            </div>
            <div className={styles.card}>
              <h3>Instant Approval</h3>
              <p>AI-driven risk assessment speeds up the application process from days to minutes.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
