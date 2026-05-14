import React from 'react';
import { Car, Star, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-[#1E1B4B]">
            {/* Left Side: Image & Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between p-12">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/cars/default_car.jpg"
                        alt="Luxury Car"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                            <Car className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
                                DiarRentCar AI
                            </h1>
                            <p className="text-xl text-white/80 font-medium max-w-md">
                                {t('auth.layout_tagline')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 bg-[#1E1B4B] relative">
                {/* Decorative Background Elements (right side) */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                </div>

                <div className="w-full max-w-[480px] relative z-10 flex justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
}
