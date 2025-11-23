-- Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER, -- in minutes
    price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Service Requests Table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number TEXT UNIQUE NOT NULL,
    service_type_id UUID REFERENCES public.services(id),
    user_id UUID REFERENCES public.users(id),
    description TEXT NOT NULL,
    preferred_date DATE,
    preferred_time TIME,
    priority TEXT DEFAULT 'NORMAL',
    equipment_details TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default services if table is empty
INSERT INTO public.services (name, description, duration, price)
SELECT 'Installation Chaudière', 'Installation complète de chaudière gaz', 240, 15000
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Installation Chaudière');

INSERT INTO public.services (name, description, duration, price)
SELECT 'Entretien Annuel', 'Nettoyage et vérification complète', 60, 3500
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Entretien Annuel');

INSERT INTO public.services (name, description, duration, price)
SELECT 'Réparation / Dépannage', 'Diagnostic et réparation de panne', 90, 4000
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Réparation / Dépannage');

INSERT INTO public.services (name, description, duration, price)
SELECT 'Installation Radiateurs', 'Pose et raccordement de radiateurs', 120, 5000
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE name = 'Installation Radiateurs');

