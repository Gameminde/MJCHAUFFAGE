'use client'

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default function ContactPage({ params }: Props) {
  const { locale } = params;
  const t = useTranslations('contact');
  const tForm = useTranslations('contact.form');
  const tInfo = useTranslations('contact.info');
  const tServices = useTranslations('contact.services');
  const currentLocale = useLocale();
  const isRTL = currentLocale === 'ar';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    wilaya: '',
    serviceType: '',
    message: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message.');
      }

      setStatus({ loading: false, error: '', success: tForm('success') });
      setFormData({ firstName: '', lastName: '', email: '', phone: '', wilaya: '', serviceType: '', message: '' });
    } catch (err) {
      setStatus({ loading: false, error: err instanceof Error ? err.message : 'An unknown error occurred.', success: '' });
    }
  };
  
  const contactInfo = [
    { 
      icon: Phone, 
      titleKey: 'phone', 
      valueKey: 'phoneValue', 
      descKey: 'phoneDesc' 
    },
    { 
      icon: Mail, 
      titleKey: 'email', 
      valueKey: 'emailValue', 
      descKey: 'emailDesc' 
    },
    { 
      icon: MapPin, 
      titleKey: 'address', 
      valueKey: 'addressValue', 
      descKey: 'addressDesc' 
    },
    { 
      icon: Clock, 
      titleKey: 'hours', 
      valueKey: 'hoursValue', 
      descKey: 'hoursDesc' 
    }
  ];

  const wilayas = ['Alger', 'Blida', 'Boumerdès', 'Tipaza', 'Constantine', 'Oran', 'Sétif', 'Batna', 'Annaba', 'Béjaïa'];

  const services = [
    { value: 'installation', key: 'installation' },
    { value: 'maintenance', key: 'maintenance' },
    { value: 'repair', key: 'repair' },
    { value: 'consultation', key: 'consultation' },
    { value: 'other', key: 'other' }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-neutral-100">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                {tForm('title')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tForm('firstName')} <span className="text-red-500">{tForm('required')}</span>
                    </label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[48px] text-base" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tForm('lastName')} <span className="text-red-500">{tForm('required')}</span>
                    </label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[48px] text-base" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tForm('email')} <span className="text-red-500">{tForm('required')}</span>
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[48px] text-base" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tForm('phone')} <span className="text-red-500">{tForm('required')}</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[48px] text-base" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tForm('wilaya')} <span className="text-red-500">{tForm('required')}</span>
                  </label>
                  <select 
                    name="wilaya" 
                    value={formData.wilaya} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[48px] text-base bg-white" 
                    required
                  >
                    <option value="">{tForm('wilaya')}</option>
                    {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tForm('serviceType')} <span className="text-red-500">{tForm('required')}</span>
                  </label>
                  <select 
                    name="serviceType" 
                    value={formData.serviceType} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[48px] text-base bg-white" 
                    required
                  >
                    <option value="">{tForm('serviceType')}</option>
                    {services.map(s => (
                      <option key={s.value} value={s.value}>{tServices(s.key)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tForm('message')} <span className="text-red-500">{tForm('required')}</span>
                  </label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    rows={5} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base resize-none" 
                    required
                  ></textarea>
                </div>
                
                {status.success && (
                  <p className="text-green-600 bg-green-50 p-4 rounded-xl">{status.success}</p>
                )}
                {status.error && (
                  <p className="text-red-600 bg-red-50 p-4 rounded-xl">{status.error}</p>
                )}

                {/* Touch-friendly submit button */}
                <button 
                  type="submit" 
                  disabled={status.loading} 
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-xl hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold min-h-[56px] touch-manipulation shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <Send className="h-5 w-5" />
                  {status.loading ? tForm('sending') : tForm('submit')}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {tInfo('title')}
              </h3>
              <div className="space-y-5">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      {/* Touch-friendly icon */}
                      <div className={`p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex-shrink-0 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                        <Icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {tInfo(info.titleKey)}
                        </h4>
                        <p className="text-gray-800 font-medium text-sm">
                          {tInfo(info.valueKey)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {tInfo(info.descKey)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Call CTA */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white text-center">
              <Phone className="h-10 w-10 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">
                {tInfo('phone')}
              </h4>
              <a 
                href="tel:+213774102255" 
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold min-h-[48px] hover:bg-orange-50 transition-colors active:scale-95"
              >
                {tInfo('phoneValue')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
