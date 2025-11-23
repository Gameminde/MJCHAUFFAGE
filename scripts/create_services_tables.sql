-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Missing in live DB but required by app)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Should match auth.users.id ideally
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    password TEXT,
    phone TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    google_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Types Table
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_ar TEXT,
    name_fr TEXT,
    description TEXT,
    duration INTEGER,
    price DECIMAL(10, 2),
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technicians Table
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    specialties TEXT[],
    status TEXT DEFAULT 'active',
    bio TEXT,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests Table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number TEXT UNIQUE NOT NULL DEFAULT 'REQ-' || floor(extract(epoch from now())),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    service_type_id UUID REFERENCES public.service_types(id),
    technician_id UUID REFERENCES public.technicians(id),
    status TEXT DEFAULT 'PENDING',
    priority TEXT DEFAULT 'NORMAL',
    preferred_date DATE,
    preferred_time TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    address TEXT,
    wilaya TEXT,
    city TEXT,
    description TEXT,
    equipment_details TEXT,
    images TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users insertable by everyone" ON public.users FOR INSERT WITH CHECK (true); -- For registration
CREATE POLICY "Users updatable by self" ON public.users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service types viewable by everyone" ON public.service_types FOR SELECT USING (true);

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Technicians viewable by everyone" ON public.technicians FOR SELECT USING (true);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own requests" ON public.service_requests FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL); -- Allow viewing if user_id matches or maybe public? No, secure it.
CREATE POLICY "Admins view all requests" ON public.service_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "Users insert own requests" ON public.service_requests FOR INSERT WITH CHECK (true); -- Allow creation

-- Seed Data
INSERT INTO public.service_types (name, name_ar, name_fr, duration, price, icon) VALUES
('Installation', 'تركيب', 'Installation', 120, 8000, 'Settings'),
('Maintenance', 'صيانة', 'Maintenance', 90, 5000, 'Wrench'),
('Repair', 'إصلاح', 'Réparation', 60, 6000, 'AlertTriangle'),
('Emergency', 'طوارئ', 'Urgence', 45, 12000, 'AlertTriangle')
ON CONFLICT DO NOTHING;
