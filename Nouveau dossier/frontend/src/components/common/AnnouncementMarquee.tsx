'use client';

import { useEffect, useState } from 'react';

interface AnnouncementMarqueeProps {
  messages?: string[];
  className?: string;
}

export function AnnouncementMarquee({
  messages = [
    "🚚 Livraison gratuite dès 50 000 DA",
    "🔧 Installation professionnelle incluse",
    "🛡️ Garantie constructeur 2 ans",
    "📞 Support technique 24/7"
  ],
  className = ''
}: AnnouncementMarqueeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`bg-primary-600 text-white py-2 overflow-hidden ${className}`}>
      <div className="relative">
        {/* Static background for smooth transition */}
        <div className="absolute inset-0 bg-primary-600" />

        {/* Animated content */}
        <div className="relative flex items-center justify-center">
          <div className="animate-pulse mr-2">📢</div>
          <div
            key={currentIndex}
            className="text-sm font-medium text-center animate-fade-in"
          >
            {messages[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
