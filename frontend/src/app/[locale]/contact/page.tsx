'use client'

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default function ContactPage({ params }: Props) {
  const { locale } = params;
  const isArabic = locale === 'ar';

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

      setStatus({ loading: false, error: '', success: 'Message sent successfully!' });
      setFormData({ firstName: '', lastName: '', email: '', phone: '', wilaya: '', serviceType: '', message: '' });
    } catch (err) {
      setStatus({ loading: false, error: err instanceof Error ? err.message : 'An unknown error occurred.', success: '' });
    }
  };
  
  // Static data (can be moved to a dictionary file later)
  const contactInfo = [
    { icon: Phone, title: isArabic ? 'الهاتف' : 'Téléphone', value: '+213 555 123 456', description: isArabic ? 'اتصل بنا في أي وقت' : 'Appelez-nous à tout moment' },
    { icon: Mail, title: isArabic ? 'البريد الإلكتروني' : 'Email', value: 'contact@mjchauffage.com', description: isArabic ? 'راسلنا عبر البريد' : 'Envoyez-nous un email' },
    { icon: MapPin, title: isArabic ? 'العنوان' : 'Adresse', value: isArabic ? 'الجزائر العاصمة، الجزائر' : 'Alger, Algérie', description: isArabic ? 'مكتبنا الرئيسي' : 'Notre bureau principal' },
    { icon: Clock, title: isArabic ? 'ساعات العمل' : 'Heures d\'ouverture', value: isArabic ? 'الأحد - الخميس: 8:00 - 18:00' : 'Dimanche - Jeudi: 8h00 - 18h00', description: isArabic ? 'الجمعة والسبت: مغلق' : 'Vendredi - Samedi: Fermé' }
  ];
  const wilayas = ['Alger', 'Blida', 'Boumerdès', 'Tipaza', 'Constantine', 'Oran']; // Shortened list

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{isArabic ? 'تواصل معنا' : 'Contactez-nous'}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{isArabic ? 'نحن هنا لخدمتكم.' : 'Nous sommes là pour vous servir.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{isArabic ? 'أرسل رسالة' : 'Envoyer un message'}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={isArabic ? 'الاسم الأول *' : 'Prénom *'} className="form-input min-h-[48px]" required />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={isArabic ? 'اسم العائلة *' : 'Nom de famille *'} className="form-input min-h-[48px]" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={isArabic ? 'البريد الإلكتروني *' : 'Email *'} className="form-input min-h-[48px]" required />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder={isArabic ? 'رقم الهاتف *' : 'Téléphone *'} className="form-input min-h-[48px]" required />
                </div>
                <select name="wilaya" value={formData.wilaya} onChange={handleInputChange} className="form-select min-h-[48px]" required>
                  <option value="">{isArabic ? 'اختر ولايتك *' : 'Sélectionnez votre wilaya *'}</option>
                  {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="form-select min-h-[48px]" required>
                  <option value="">{isArabic ? 'اختر نوع الخدمة *' : 'Sélectionnez un service *'}</option>
                  <option value="installation">
                      {isArabic ? 'التركيب' : 'Installation'}
                    </option>
                    <option value="maintenance">
                      {isArabic ? 'الصيانة' : 'Maintenance'}
                    </option>
                    <option value="repair">
                      {isArabic ? 'الإصلاح' : 'Réparation'}
                    </option>
                    <option value="consultation">
                      {isArabic ? 'استشارة' : 'Consultation'}
                    </option>
                    <option value="other">
                      {isArabic ? 'أخرى' : 'Autre'}
                    </option>
                </select>
                <textarea name="message" value={formData.message} onChange={handleInputChange} rows={5} placeholder={isArabic ? 'رسالتك *' : 'Votre message *'} className="form-textarea" required></textarea>
                
                {status.success && <p className="text-green-600">{status.success}</p>}
                {status.error && <p className="text-red-600">{status.error}</p>}

                <button type="submit" disabled={status.loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold min-h-[48px] touch-manipulation">
                  <Send className="h-5 w-5" />
                  {status.loading ? (isArabic ? 'جار الإرسال...' : 'Envoi...') : (isArabic ? 'إرسال الرسالة' : 'Envoyer le message')}
                </button>
              </form>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{isArabic ? 'معلومات التواصل' : 'Informations de contact'}</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="p-2 bg-blue-100 rounded-lg mr-4"><Icon className="h-5 w-5 text-blue-600" /></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{info.title}</h4>
                        <p className="text-gray-800 font-medium">{info.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}