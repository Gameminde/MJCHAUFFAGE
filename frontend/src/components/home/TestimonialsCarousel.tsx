'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  initials: string;
  rating: number;
  gradient: string;
}

interface TestimonialsCarouselProps {
  testimonials?: Testimonial[];
}

export function TestimonialsCarousel({
  testimonials
}: TestimonialsCarouselProps) {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default testimonials if none provided
  const defaultTestimonials: Testimonial[] = [
    {
      id: 'jean',
      name: t('home.testimonials.jean.name'),
      role: t('home.testimonials.jean.role'),
      quote: t('home.testimonials.jean.quote'),
      initials: 'JD',
      rating: 5,
      gradient: 'from-primary-400 to-primary-600'
    },
    {
      id: 'marie',
      name: t('home.testimonials.marie.name'),
      role: t('home.testimonials.marie.role'),
      quote: t('home.testimonials.marie.quote'),
      initials: 'ML',
      rating: 5,
      gradient: 'from-secondary-400 to-secondary-600'
    },
    {
      id: 'thomas',
      name: t('home.testimonials.thomas.name'),
      role: t('home.testimonials.thomas.role'),
      quote: t('home.testimonials.thomas.quote'),
      initials: 'TL',
      rating: 5,
      gradient: 'from-primary-500 to-secondary-500'
    }
  ];

  const displayTestimonials = testimonials || defaultTestimonials;
  const currentTestimonial = displayTestimonials[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 6000); // Change testimonial every 6 seconds

    return () => clearInterval(interval);
  }, [displayTestimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayTestimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg">
      {/* Main Testimonial Card */}
      <div className="text-center max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${currentTestimonial.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
            {currentTestimonial.initials}
          </div>
        </div>

        {/* Rating */}
        <div className="flex justify-center mb-4">
          {renderStars(currentTestimonial.rating)}
        </div>

        {/* Quote */}
        <blockquote className="text-lg text-gray-700 italic mb-6 leading-relaxed">
          "{currentTestimonial.quote}"
        </blockquote>

        {/* Author */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-1">
            {currentTestimonial.name}
          </h4>
          <p className="text-sm text-gray-600">
            {currentTestimonial.role}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Dots Navigation */}
      <div className="flex justify-center mt-8 space-x-2">
        {displayTestimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTestimonial(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary-600 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mt-6">
        <div className="bg-gray-200 rounded-full h-1 overflow-hidden">
          <div
            className="bg-primary-600 h-full transition-all duration-6000 ease-linear"
            style={{
              width: `${((currentIndex + 1) / displayTestimonials.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
