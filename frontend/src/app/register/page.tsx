'use client';

import { useState, useEffect, useCallback, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Phone,
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

interface FieldErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
}

const inputBase = "w-full h-[54px] bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-medium text-[15px] backdrop-blur-sm";

const FormGroup = ({ id, label, icon: Icon, type, value, onChange, onBlur, placeholder, rightIcon, errorState, autoComplete }: any) => {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[14px] font-medium text-slate-300 ml-1">
                {label}
            </label>
            <div className="relative group">
                <div className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 flex items-center justify-center",
                    errorState ? "text-red-400" : "text-slate-500 group-focus-within:text-purple-400"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={cn(
                        inputBase,
                        "!pl-12",
                        rightIcon ? "pr-12" : "pr-4",
                        errorState && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    )}
                    autoComplete={autoComplete}
                />
                {rightIcon}
            </div>
            {errorState && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400 ml-1 mt-0.5">
                    <AlertCircle className="w-[14px] h-[14px]" />
                    {errorState}
                </p>
            )}
        </div>
    );
};

export default function RegisterPage() {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // UI state
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [globalError, setGlobalError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    useEffect(() => setMounted(true), []);

    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(e.target.value);
    }, []);

    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }, []);

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
    }, []);

    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }, []);

    const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    }, []);

    // Password strength logic
    const calculateStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '', color: 'bg-gray-200 dark:bg-gray-700' };

        let score = 0;
        if (pass.length > 5) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score === 1) return { score: 1, label: t('auth.strength.weak'), color: 'bg-red-500' };
        if (score === 2) return { score: 2, label: t('auth.strength.fair'), color: 'bg-orange-500' };
        if (score === 3) return { score: 3, label: t('auth.strength.good'), color: 'bg-yellow-500' };
        if (score >= 4) return { score: 4, label: t('auth.strength.strong'), color: 'bg-green-500' };
        return { score: 0, label: '', color: 'bg-gray-200 dark:bg-gray-700' };
    };

    const strength = calculateStrength(password);

    // Validation logic
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'fullName':
                return value.trim() ? '' : t('auth.errors.name_required');
            case 'email':
                if (!value.trim()) return t('auth.errors.email_required');
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : t('auth.errors.email_invalid');
            case 'phone':
                if (!value.trim()) return t('auth.errors.phone_required');
                return value.replace(/[^0-9]/g, '').length >= 9 ? '' : t('auth.errors.phone_invalid');
            case 'password':
                if (!value) return t('auth.errors.password_required');
                return value.length >= 8 ? '' : t('auth.errors.password_len');
            case 'confirmPassword':
                if (!value) return t('auth.errors.passwords_dont_match'); // or specific "repeat password" error
                return value === password ? '' : t('auth.errors.passwords_dont_match');
            default:
                return '';
        }
    };

    const handleBlur = (field: keyof FieldErrors, value: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, value);
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const validateAll = (): boolean => {
        const errors = {
            fullName: validateField('fullName', fullName),
            email: validateField('email', email),
            phone: validateField('phone', phone),
            password: validateField('password', password),
            confirmPassword: validateField('confirmPassword', confirmPassword)
        };

        setFieldErrors(errors);

        // Return true if NO errors exist AND terms are agreed
        return Object.values(errors).every(err => !err) && termsAgreed;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError('');

        // Mark all fields as touched
        setTouched({
            fullName: true, email: true, phone: true, password: true, confirmPassword: true
        });

        if (!validateAll()) {
            if (!termsAgreed) setGlobalError(t('auth.errors.terms_required'));
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/register', {
                full_name: fullName,
                email: email,
                phone: phone,
                password: password
            });
            if (res.data.success) {
                // Registration successful, redirect to login
                router.push('/login');
            }
        } catch (err: any) {
            setGlobalError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

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
                <div className="flex flex-col items-center gap-3 mb-7">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                        <Car className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white tracking-tight">DiarRentCar AI</h1>
                        <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mt-1">{t('auth.premium_mobility')}</p>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-7 text-center">
                    <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight">
                        {t('auth.create_account')}
                    </h2>
                    <p className="text-[15px] text-slate-400 mt-2">
                        {t('auth.signup_subtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10" noValidate>

                    <FormGroup
                        id="fullName"
                        label={t('auth.label_full_name')}
                        icon={User}
                        type="text"
                        value={fullName}
                        onChange={handleFullNameChange}
                        onBlur={(e: any) => handleBlur('fullName', e.target.value)}
                        placeholder={t('auth.placeholder_name')}
                        errorState={touched.fullName && fieldErrors.fullName}
                        autoComplete="name"
                    />

                    <FormGroup
                        id="email"
                        label={t('auth.label_email')}
                        icon={Mail}
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={(e: any) => handleBlur('email', e.target.value)}
                        placeholder={t('auth.placeholder_email')}
                        errorState={touched.email && fieldErrors.email}
                        autoComplete="email"
                    />

                    <FormGroup
                        id="phone"
                        label={t('auth.label_phone')}
                        icon={Phone}
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        onBlur={(e: any) => handleBlur('phone', e.target.value)}
                        placeholder={t('auth.placeholder_phone')}
                        errorState={touched.phone && fieldErrors.phone}
                        autoComplete="tel"
                    />

                    <div className="flex flex-col gap-1">
                        <FormGroup
                            id="password"
                            label={t('auth.label_password')}
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={(e: any) => handleBlur('password', e.target.value)}
                            placeholder={t('auth.placeholder_strong_password')}
                            errorState={touched.password && fieldErrors.password}
                            autoComplete="new-password"
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                                </button>
                            }
                        />
                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="flex items-center gap-2 mt-1.5 ml-1">
                                <div className="flex-1 flex h-1 gap-1.5">
                                    {[1, 2, 3, 4].map((index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "h-full flex-1 rounded-full transition-all duration-500",
                                                index <= strength.score ? strength.color : "bg-white/10"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", {
                                    'text-red-500': strength.score === 1,
                                    'text-orange-500': strength.score === 2,
                                    'text-yellow-500': strength.score === 3,
                                    'text-green-500': strength.score === 4,
                                })}>{strength.label}</span>
                            </div>
                        )}
                    </div>

                    <FormGroup
                        id="confirmPassword"
                        label={t('auth.label_confirm_password')}
                        icon={Lock}
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        onBlur={(e: any) => handleBlur('confirmPassword', e.target.value)}
                        placeholder={t('auth.placeholder_repeat_password')}
                        errorState={touched.confirmPassword && fieldErrors.confirmPassword}
                        autoComplete="new-password"
                        rightIcon={
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                                {touched.confirmPassword && confirmPassword && (
                                    confirmPassword === password ?
                                        <CheckCircle2 className="w-[18px] h-[18px] text-green-500" /> :
                                        <XCircle className="w-[18px] h-[18px] text-red-500" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="text-slate-500 hover:text-white transition-colors flex items-center justify-center"
                                >
                                    {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                                </button>
                            </div>
                        }
                    />

                    {/* Terms Checkbox */}
                    <div className="flex items-start my-1 text-[13px] ml-1">
                        <label className="flex gap-3 cursor-pointer group select-none">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={termsAgreed}
                                    onChange={(e) => {
                                        setTermsAgreed(e.target.checked);
                                        if (e.target.checked) setGlobalError('');
                                    }}
                                    className="peer appearance-none w-5 h-5 border border-white/10 rounded-lg bg-slate-900/50 checked:bg-gradient-to-br from-purple-600 to-blue-600 checked:border-transparent focus:outline-none transition-all cursor-pointer"
                                />
                                <svg className="absolute w-3 h-3 opacity-0 peer-checked:opacity-100 text-white pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-slate-400 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                                {t('auth.terms_agree')} <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">{t('auth.terms_of_service')}</a> {t('auth.and')} <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">{t('auth.privacy_policy')}</a>
                            </span>
                        </label>
                    </div>

                    {/* Global Error message */}
                    <AnimatePresence mode="wait">
                        {globalError && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-3 text-red-200 text-[14px] font-medium bg-red-500/10 backdrop-blur-md p-4 rounded-xl border border-red-500/20"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                                <span>{globalError}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Create Account Button */}
                    <button
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        disabled={loading || success}
                        type="submit"
                        style={{
                            backgroundColor: isHovered ? '#6D28D9' : '#7C3AED',
                            color: '#ffffff',
                            width: '100%',
                            height: '50px',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: (loading || success) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: (loading || success) ? 0.7 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>{t('auth.creating')}</span>
                            </>
                        ) : success ? (
                            <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" />
                        ) : (
                            <span>{t('auth.signup_btn')}</span>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink mx-4 text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('auth.divider')}</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center text-[15px] mt-2">
                        <span className="text-slate-400">{t('auth.have_account')} </span>
                        <Link href="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                            {t('auth.goto_signin')}
                        </Link>
                    </div>

                </form>
            </motion.div>
        </AuthLayout>
    );
}
