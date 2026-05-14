'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Tag, Brain, Zap, ShieldCheck,
  Search, Cpu, CheckCircle, Calendar,
  User, Quote, Sparkles, Trophy,
  ChevronRight, Star, Car as CarIcon
} from 'lucide-react';
import { Car } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Button from '@/components/ui/Button';
import CarCard from '@/components/CarCard';
import RentalCalculator from '@/components/RentalCalculator';
import SmartComparison from '@/components/SmartComparison';

export default function Home() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const { t, language } = useTranslation();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#0F0F1A]" />;
  }

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.blobsContainer}>
          <div className={`${styles.blob} ${styles.blob1}`}></div>
          <div className={`${styles.blob} ${styles.blob2}`}></div>
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.title}>
            {t('hero.title1')} <br /><span className={styles.highlight}>{t('hero.title2')}</span>
          </h1>
          <p className={styles.subtitle}>
            {t('hero.subtitle')}
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/cars">
              <Button size="lg">{t('hero.rentBtn')}</Button>
            </Link>
            <Link href="/cars?type=leasing">
              <Button variant="outline" size="lg">{t('hero.leasingBtn')}</Button>
            </Link>
          </div>

          <div className={styles.heroAdvantages}>
            <div className={styles.heroAdvantageItem}>
              <Tag size={18} className={styles.heroAdvantageIcon} />
              <span>{t('hero.adv_prices')}</span>
            </div>
            <div className={styles.heroAdvantageItem}>
              <Brain size={18} className={styles.heroAdvantageIcon} />
              <span>{t('hero.adv_ai')}</span>
            </div>
            <div className={styles.heroAdvantageItem}>
              <Zap size={18} className={styles.heroAdvantageIcon} />
              <span>{t('hero.adv_fast')}</span>
            </div>
            <div className={styles.heroAdvantageItem}>
              <ShieldCheck size={18} className={styles.heroAdvantageIcon} />
              <span>{t('hero.adv_trusted')}</span>
            </div>
          </div>

          <div className={styles.heroImageContainer}>
            <img
              src="/images/cars/default_car.jpg"
              alt="Luxury Car Overview"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <div className="flex justify-center mb-2 text-purple-400"><User size={24} /></div>
          <div className={styles.statValue}>10k+</div>
          <div className={styles.statLabel}>{t('stats.renters')}</div>
        </div>
        <div className={styles.statItem}>
          <div className="flex justify-center mb-2 text-purple-400"><CarIcon size={24} /></div>
          <div className={styles.statValue}>500+</div>
          <div className={styles.statLabel}>{t('stats.cars')}</div>
        </div>
        <div className={styles.statItem}>
          <div className="flex justify-center mb-2 text-purple-400"><Zap size={24} /></div>
          <div className={styles.statValue}>1 Min</div>
          <div className={styles.statLabel}>{t('stats.approval')}</div>
        </div>
      </div>

      {/* Category Section */}
      <section className="w-full flex flex-col items-center py-20 px-6 overflow-visible">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-[32px] font-bold text-white mb-2">{t('category.title')}</h2>
          <p className="text-[15px] text-[#94A3B8]">{t('category.subtitle')}</p>
        </div>

        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch px-6">
          {/* Card 1 - Standard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0, duration: 0.5, ease: "easeOut" }}
            onClick={() => router.push('/cars?category=standard')}
            className="cursor-pointer flex flex-col h-full rounded-[20px] overflow-hidden bg-[#1E1B4B] border border-[#7C3AED]/30 transition-all duration-[250ms] ease-in-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(124,58,237,0.3)] group"
          >
            {/* Image Section */}
            <div className="h-[220px] w-full relative overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600"
                alt="Standard Car"
                className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
              />
              {/* Badge */}
              <div className="absolute top-3 right-3 bg-[#2563EB]/90 text-white text-[11px] font-bold px-3 py-1 rounded-full z-10">
                {t('category.badge.economy')}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 text-center gap-3">
              <h3 className="text-[22px] font-bold text-white mb-1">{t('category.standard.title')}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed flex-1">{t('category.standard.desc')}</p>
              
              {/* Divider */}
              <div className="h-px w-full bg-white/10 my-1" />

              <div className="w-full">
                <p className="text-[#60A5FA] font-bold text-lg">
                  {formatPrice(18000)} – {formatPrice(35000)} / {t('car.per_day')}
                </p>
                <div className="w-full h-11 flex items-center justify-center bg-[#7C3AED] text-white rounded-[10px] text-sm font-semibold transition-colors duration-200 mt-1 hover:bg-[#6D28D9]">
                  {t('category.btn.view')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 - Comfort */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            onClick={() => router.push('/cars?category=comfort')}
            className="cursor-pointer flex flex-col h-full rounded-[20px] overflow-hidden bg-[#1E1B4B] border-2 border-[#7C3AED] transition-all duration-[250ms] ease-in-out hover:-translate-y-2 shadow-[0_8px_32px_rgba(124,58,237,0.25)] hover:shadow-[0_20px_40px_rgba(124,58,237,0.3)] group"
          >
            {/* Image Section */}
            <div className="h-[220px] w-full relative overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600"
                alt="Comfort Car"
                className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
              />
              {/* Badge */}
              <div className="absolute top-3 right-3 bg-[#7C3AED]/90 text-white text-[11px] font-bold px-3 py-1 rounded-full z-10">
                {t('category.popular.label')}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 text-center gap-3">
              <h3 className="text-[22px] font-bold text-white mb-1">{t('category.comfort.title')}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed flex-1">{t('category.comfort.desc')}</p>
              
              {/* Divider */}
              <div className="h-px w-full bg-white/10 my-1" />

              <div className="w-full">
                <p className="text-[#A78BFA] font-bold text-lg">
                  {formatPrice(55000)} – {formatPrice(95000)} / {t('car.per_day')}
                </p>
                <div className="w-full h-11 flex items-center justify-center bg-[#7C3AED] text-white rounded-[10px] text-sm font-semibold transition-colors duration-200 mt-1 hover:bg-[#6D28D9]">
                  {t('category.btn.view')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 - Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            onClick={() => router.push('/cars?category=premium')}
            className="cursor-pointer flex flex-col h-full rounded-[20px] overflow-hidden bg-[#1E1B4B] border border-[#7C3AED]/30 transition-all duration-[250ms] ease-in-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(124,58,237,0.3)] group"
          >
            {/* Image Section */}
            <div className="h-[220px] w-full relative overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600"
                alt="Premium Car"
                className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
              />
              {/* Badge */}
              <div className="absolute top-3 right-3 bg-[#D97706]/90 text-white text-[11px] font-bold px-3 py-1 rounded-full z-10">
                {t('category.badge.luxury')}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 text-center gap-3">
              <h3 className="text-[22px] font-bold text-white mb-1">{t('category.premium.title')}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed flex-1">{t('category.premium.desc')}</p>
              
              {/* Divider */}
              <div className="h-px w-full bg-white/10 my-1" />

              <div className="w-full">
                <p className="text-[#FBBF24] font-bold text-lg">
                  {formatPrice(110000)} – {formatPrice(200000)} / {t('car.per_day')}
                </p>
                <div className="w-full h-11 flex items-center justify-center bg-[#7C3AED] text-white rounded-[10px] text-sm font-semibold transition-colors duration-200 mt-1 hover:bg-[#6D28D9]">
                  {t('category.btn.view')}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>      <section className={styles.aiBlock}>
        <div className={`container ${styles.aiContainer}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.sectionTitle}>{t('ai.title')} <span className={styles.highlight}>{t('ai.highlight')}</span></h2>
            <p className={styles.sectionSubtitle}>{t('ai.subtitle')}</p>

            <div className={styles.aiSearchBox}>
              <input
                type="text"
                placeholder={t('ai.placeholder')}
                className={styles.aiInput}
              />
              <Link href="/predict" style={{ display: 'flex' }}>
                <Button size="lg">
                  <Sparkles size={18} style={{ marginRight: '0.5rem' }} />
                  {t('ai.btn')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <SmartComparison />

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('sections.how_it_works_title')} <span className={styles.highlight}>{t('sections.how_it_works_highlight')}</span></h2>
            <p className={styles.sectionSubtitle}>{t('sections.how_it_works_subtitle')}</p>
          </div>

          <div className={styles.howItWorksGrid}>
            {[
              { icon: <Search />, title: t('how_it_works.step1_title'), desc: t('how_it_works.step1_desc') },
              { icon: <Cpu />, title: t('how_it_works.step2_title'), desc: t('how_it_works.step2_desc') },
              { icon: <Trophy />, title: t('how_it_works.step3_title'), desc: t('how_it_works.step3_desc') },
              { icon: <CheckCircle />, title: t('how_it_works.step4_title'), desc: t('how_it_works.step4_desc') }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={styles.stepIconWrapper}>
                  {step.icon}
                  <div className={styles.stepNumber}>{idx + 1}</div>
                </div>
                <h3 className={styles.benefitTitle}>{step.title}</h3>
                <p className={styles.benefitText}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.benefits}`} style={{ backgroundColor: 'hsl(var(--muted)/0.5)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('sections.why_choose_title')} <span className={styles.highlight}>{t('sections.why_choose_highlight')}</span></h2>
            <p className={styles.sectionSubtitle}>{t('sections.why_choose_subtitle')}</p>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>🛡️</div>
              <h3 className={styles.benefitTitle}>{t('benefits.title1')}</h3>
              <p className={styles.benefitText}>{t('benefits.desc1')}</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>✨</div>
              <h3 className={styles.benefitTitle}>{t('benefits.title2')}</h3>
              <p className={styles.benefitText}>{t('benefits.desc2')}</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>⚡</div>
              <h3 className={styles.benefitTitle}>{t('benefits.title3')}</h3>
              <p className={styles.benefitText}>{t('benefits.desc3')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('reviews.title')} <span className={styles.highlight}>{t('reviews.highlight')}</span></h2>
            <p className={styles.sectionSubtitle}>{t('reviews.subtitle')}</p>
          </div>

          <div className={styles.reviewsGrid}>
            {[
              { name: "Alex Johnson", text: t('reviews.text1'), role: t('reviews.role1') },
              { name: "Sarah Miller", text: t('reviews.text2'), role: t('reviews.role2') },
              { name: "Michael Chen", text: t('reviews.text3'), role: t('reviews.role3') }
            ].map((review, idx) => (
              <motion.div
                key={idx}
                className={styles.reviewCard}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Quote size={32} className={styles.heroAdvantageIcon} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p className={styles.reviewContent}>"{review.text}"</p>
                <div className={styles.reviewAuthor}>
                  <div className={styles.avatar}>
                    {review.name[0]}
                  </div>
                  <div className={styles.authorInfo}>
                    <h4>{review.name}</h4>
                    <p>{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCTA}>
        <div className="container">
          <div className={styles.ctaGlass}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2>{t('cta.title')} <span className={styles.highlight}>{t('cta.highlight')}</span></h2>
              <p>{t('cta.desc')}</p>
              <div className={styles.ctaGroup}>
                <Link href="/rent">
                  <Button size="lg">{t('cta.rentBtn')}</Button>
                </Link>
                <Link href="/leasing">
                  <Button variant="outline" size="lg">{t('cta.leasingBtn')}</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {selectedCar && (
        <RentalCalculator
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </main>
  );
}
