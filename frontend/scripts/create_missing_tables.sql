
-- Create Technicians Table if not exists
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    specialties TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Service Types Table
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2),
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Service Requests Table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id),
    service_type_id UUID REFERENCES public.service_types(id),
    technician_id UUID REFERENCES public.technicians(id),
    status TEXT DEFAULT 'PENDING', -- PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    priority TEXT DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    description TEXT,
    notes TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    address TEXT,
    equipment_details TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default service types if empty
INSERT INTO public.service_types (name, description, base_price, duration_minutes)
SELECT 'Installation', 'Installation of new heating system', 5000, 120
WHERE NOT EXISTS (SELECT 1 FROM public.service_types WHERE name = 'Installation');

INSERT INTO public.service_types (name, description, base_price, duration_minutes)
SELECT 'Maintenance', 'Regular maintenance checkup', 2500, 60
WHERE NOT EXISTS (SELECT 1 FROM public.service_types WHERE name = 'Maintenance');

INSERT INTO public.service_types (name, description, base_price, duration_minutes)
SELECT 'Repair', 'Diagnostic and repair of faulty system', 3000, 90
WHERE NOT EXISTS (SELECT 1 FROM public.service_types WHERE name = 'Repair');

