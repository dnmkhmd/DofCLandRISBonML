'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../translations/en.json';
import kz from '../translations/kz.json';
import ru from '../translations/ru.json';

type Language = 'en' | 'kz' | 'ru';
type Translations = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string, options?: string | Record<string, string | number>) => string;
}

const translations: Record<Language, Translations> = { en, kz, ru };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to 'kz' as requested
    const [language, setLanguageState] = useState<Language>('kz');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'kz' || savedLang === 'ru')) {
            setLanguageState(savedLang);
        }
        setIsMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    };

    const t = (path: string, options?: string | Record<string, string | number>): string => {
        const keys = path.split('.');
        let result: any = translations[language];

        for (const key of keys) {
            if (result && typeof result === 'object' && result[key]) {
                result = result[key];
            } else {
                // If missing, check if options is a fallback string
                return typeof options === 'string' ? options : path;
            }
        }

        let translationText = typeof result === 'string' ? result : path;

        // Perform interpolation if options is an object
        if (options && typeof options === 'object') {
            Object.entries(options).forEach(([key, value]) => {
                translationText = translationText.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            });
        }

        return translationText;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {!isMounted ? (
                <div style={{ visibility: 'hidden' }}>{children}</div>
            ) : (
                children
            )}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
