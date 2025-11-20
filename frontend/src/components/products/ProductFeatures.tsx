interface ProductFeaturesProps {
  features: string[];
  locale: string;
}

export function ProductFeatures({ features, locale }: ProductFeaturesProps) {
  const isArabic = locale === 'ar';

  return (
    <ul className="space-y-golden-xs">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-golden-sm text-golden-sm text-gray-700">
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}








