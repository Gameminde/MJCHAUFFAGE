import { Phone } from 'lucide-react';

export function MobileCallButton() {
    return (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
            <a
                href="tel:0774102255"
                className="flex items-center justify-center w-full bg-[#D9772F] text-white font-bold py-4 rounded-full shadow-lg hover:bg-[#c66a26] transition-colors"
            >
                Appelez-nous
            </a>
        </div>
    );
}
