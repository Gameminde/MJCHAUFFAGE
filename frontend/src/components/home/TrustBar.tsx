'use client';

import { Calendar, Headphones, CheckCircle, Phone } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export function TrustBar() {
    const t = useTranslations('trust');
    const locale = useLocale();
    const isRTL = locale === 'ar';

    const items = [
        {
            icon: Calendar,
            titleKey: 'experience',
            subtitleKey: 'experienceLabel'
        },
        {
            icon: Headphones,
            titleKey: 'support',
            subtitleKey: 'supportLabel'
        },
        {
            icon: CheckCircle,
            titleKey: 'installation',
            subtitleKey: 'installationLabel'
        },
        {
            icon: Phone,
            titleKey: 'callUs',
            subtitleKey: 'phone'
        }
    ];

    return (
        <div className="bg-[#F5F0E6] py-6 md:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4">
                {/* Mobile: 2x2 grid, Desktop: 4 columns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div 
                                key={index} 
                                className="flex items-center justify-center gap-3 md:gap-4 p-3 md:p-0 rounded-xl md:rounded-none bg-white/50 md:bg-transparent"
                            >
                                {/* Touch-friendly icon container - minimum 48x48px */}
                                <div className="p-3 md:p-2 bg-orange-100 md:bg-transparent rounded-full flex-shrink-0">
                                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-gray-900 text-sm md:text-lg truncate">
                                        {t(item.titleKey)}
                                    </span>
                                    <span className="text-gray-600 font-medium text-xs md:text-base truncate">
                                        {t(item.subtitleKey)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
