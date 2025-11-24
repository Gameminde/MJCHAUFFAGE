import { Calendar, Headphones, CheckCircle, Phone } from 'lucide-react';

export function TrustBar() {
    const items = [
        {
            icon: <Calendar className="w-6 h-6 text-orange-600" />,
            title: "10 Ans",
            subtitle: "d'Expérience"
        },
        {
            icon: <Headphones className="w-6 h-6 text-orange-600" />,
            title: "Service Client",
            subtitle: "24/7"
        },
        {
            icon: <CheckCircle className="w-6 h-6 text-orange-600" />,
            title: "Installation",
            subtitle: "Certifiée"
        },
        {
            icon: <Phone className="w-6 h-6 text-orange-600" />,
            title: "Appelez-nous:",
            subtitle: "0774 102 255"
        }
    ];

    return (
        <div className="hidden lg:block bg-[#F5F0E6] py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-4 gap-8">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-center gap-4">
                            <div className="p-2">
                                {item.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-lg">{item.title}</span>
                                <span className="text-gray-600 font-medium">{item.subtitle}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
