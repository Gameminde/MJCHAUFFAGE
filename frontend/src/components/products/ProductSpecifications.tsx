interface ProductSpecificationsProps {
  specifications: Record<string, string>;
  locale: string;
}

export function ProductSpecifications({ specifications, locale }: ProductSpecificationsProps) {
  const isArabic = locale === 'ar';

  return (
    <div className="grid gap-golden-sm md:grid-cols-2">
      {Object.entries(specifications).map(([key, value]) => (
        <div key={key} className="flex justify-between py-golden-sm px-golden-md bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-golden-sm font-medium text-gray-700">
            {key}
          </span>
          <span className="text-golden-sm text-gray-900 font-semibold">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}








