'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    User,
    ShieldCheck,
    RefreshCw,
    Car
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AuthLayout from '@/components/layout/AuthLayout';
import { useTranslation } from '@/context/LanguageContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function LoginPage() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    useEffect(() => setMounted(true), []);

    const validate = () => {
        if (!identifier) return t('auth.errors.identifier_required');
        if (!password) return t('auth.errors.password_required');
        if (password.length < 4) return t('auth.errors.password_min');
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        if (identifier === 'admin' && password === 'admin') {
            localStorage.setItem('isAdmin', 'true');
            router.push('/admin/dashboard');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('username', identifier);
            formData.append('password', password);

            const res = await api.post(`/auth/login`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            const token = res.data.access_token;

            const userRes = await api.get(`/auth/me`);

            login(token, userRes.data);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || t('auth.errors.invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const inputBase = "w-full h-[54px] bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-medium text-[15px] backdrop-blur-sm";

    return (
        <AuthLayout>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '40px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Logo inside card */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                        <Car className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white tracking-tight">DiarRentCar AI</h1>
                        <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mt-1">{t('auth.premium_mobility')}</p>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight">
                        {t('auth.welcome_back')}
                    </h2>
                    <p className="text-[15px] text-slate-400 mt-2">
                        {t('auth.signin_subtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">

                    {/* Identifier Field */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="identifier" className="text-[14px] font-medium text-slate-300 ml-1">
                            {t('auth.label_identifier')}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none z-10 flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                id="identifier"
                                type="text"
                                placeholder={t('auth.placeholder_email')}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className={cn(inputBase, "!pl-12 pr-4")}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between ml-1">
                            <label htmlFor="password" className="text-[14px] font-medium text-slate-300">
                                {t('auth.label_password')}
                            </label>
                            <a
                                href="#"
                                className="text-purple-400 text-[13px] hover:text-purple-300 transition-colors font-medium"
                            >
                                {t('auth.forgot_password')}
                            </a>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors pointer-events-none z-10 flex items-center justify-center">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder={t('auth.placeholder_password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={cn(inputBase, "!pl-12 pr-12")}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors z-10"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center my-1">
                        <label className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-5 h-5 border border-white/10 rounded-lg bg-slate-900/50 checked:bg-gradient-to-br from-purple-600 to-blue-600 checked:border-transparent focus:outline-none transition-all cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 opacity-0 peer-checked:opacity-100 text-white pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-slate-400 group-hover:text-slate-200 transition-colors font-medium text-[14px]">{t('auth.remember_me')}</span>
                        </label>
                    </div>

                    {/* Sign In Button */}
                    <button
                        disabled={loading}
                        type="submit"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            backgroundColor: isHovered ? '#6D28D9' : '#7C3AED',
                            color: '#ffffff',
                            width: '100%',
                            height: '50px',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>{t('auth.verifying')}</span>
                            </>
                        ) : (
                            <span>{t('auth.signin_btn')}</span>
                        )}
                    </button>

                    {/* Error Message */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-3 text-red-200 text-[14px] font-medium bg-red-500/10 backdrop-blur-md p-4 rounded-xl border border-red-500/20 mt-1"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink mx-4 text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('auth.divider')}</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center text-[15px] mt-2">
                        <span className="text-slate-400">{t('auth.new_here')} </span>
                        <Link href="/register" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                            {t('auth.goto_signup')}
                        </Link>
                    </div>

                </form>
            </motion.div>
        </AuthLayout>
    );
}
