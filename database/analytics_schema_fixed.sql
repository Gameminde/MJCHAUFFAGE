-- =====================================================
-- Analytics Database Schema - FIXED VERSION
-- =====================================================
-- Run this script in Supabase SQL Editor to create analytics tables
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Analytics Events Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    page_path TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    event_data JSONB,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Analytics Daily Sales Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics_daily_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    pending_orders INTEGER DEFAULT 0,
    total_tax DECIMAL(10, 2) DEFAULT 0,
    total_shipping DECIMAL(10, 2) DEFAULT 0,
    total_discounts DECIMAL(10, 2) DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. Analytics Product Performance Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics_product_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    add_to_cart INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    cart_abandonment_rate DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, date)
);

-- =====================================================
-- 4. Analytics Customer Segments Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics_customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    segment TEXT NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    first_order_date TIMESTAMP WITH TIME ZONE,
    last_order_date TIMESTAMP WITH TIME ZONE,
    days_since_last_order INTEGER,
    lifetime_value DECIMAL(10, 2) DEFAULT 0,
    predicted_ltv DECIMAL(10, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- =====================================================
-- 5. Create Indexes
-- =====================================================

-- Analytics Events Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product ON public.analytics_events(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON public.analytics_events(category_id) WHERE category_id IS NOT NULL;

-- Daily Sales Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_daily_sales_date ON public.analytics_daily_sales(date DESC);

-- Product Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_product_perf_product ON public.analytics_product_performance(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_product_perf_date ON public.analytics_product_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_product_perf_revenue ON public.analytics_product_performance(revenue DESC);

-- Customer Segments Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_customer_seg_segment ON public.analytics_customer_segments(segment);
CREATE INDEX IF NOT EXISTS idx_analytics_customer_seg_ltv ON public.analytics_customer_segments(lifetime_value DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_customer_seg_last_order ON public.analytics_customer_segments(last_order_date DESC);

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function to refresh daily sales
CREATE OR REPLACE FUNCTION public.refresh_daily_sales_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.analytics_daily_sales WHERE date = target_date;
    
    INSERT INTO public.analytics_daily_sales (
        date,
        total_revenue,
        total_orders,
        total_items_sold,
        average_order_value,
        completed_orders,
        pending_orders,
        cancelled_orders,
        total_tax,
        total_shipping,
        total_discounts
    )
    SELECT
        target_date,
        COALESCE(SUM(CASE WHEN o.status != 'CANCELLED' THEN o.total_amount ELSE 0 END), 0),
        COUNT(*),
        COALESCE(SUM(oi.total_quantity), 0),
        COALESCE(AVG(CASE WHEN o.status != 'CANCELLED' THEN o.total_amount ELSE NULL END), 0),
        COUNT(*) FILTER (WHERE o.status = 'COMPLETED'),
        COUNT(*) FILTER (WHERE o.status = 'PENDING'),
        COUNT(*) FILTER (WHERE o.status = 'CANCELLED'),
        COALESCE(SUM(o.tax_amount), 0),
        COALESCE(SUM(o.shipping_amount), 0),
        COALESCE(SUM(o.discount_amount), 0)
    FROM public.orders o
    LEFT JOIN (
        SELECT order_id, SUM(quantity) as total_quantity
        FROM public.order_items
        GROUP BY order_id
    ) oi ON o.id = oi.order_id
    WHERE DATE(o.created_at) = target_date;
END;
$$;

-- Function to refresh product performance (without analytics_events dependency)
CREATE OR REPLACE FUNCTION public.refresh_product_performance(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.analytics_product_performance WHERE date = target_date;
    
    INSERT INTO public.analytics_product_performance (
        product_id,
        date,
        purchases,
        units_sold,
        revenue
    )
    SELECT
        oi.product_id,
        target_date,
        COUNT(DISTINCT oi.order_id),
        SUM(oi.quantity),
        SUM(oi.total_price)
    FROM public.order_items oi
    INNER JOIN public.orders o ON oi.order_id = o.id
    WHERE DATE(o.created_at) = target_date
        AND o.status != 'CANCELLED'
    GROUP BY oi.product_id;
END;
$$;

-- Function to refresh customer segments
CREATE OR REPLACE FUNCTION public.refresh_customer_segments()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public.analytics_customer_segments;
    
    INSERT INTO public.analytics_customer_segments (
        customer_id,
        segment,
        total_orders,
        total_spent,
        average_order_value,
        first_order_date,
        last_order_date,
        days_since_last_order,
        lifetime_value
    )
    SELECT
        c.id,
        CASE
            WHEN customer_stats.total_spent > 50000 THEN 'VIP'
            WHEN customer_stats.total_orders = 1 AND customer_stats.days_since_last <= 30 THEN 'NEW'
            WHEN customer_stats.days_since_last > 180 THEN 'LOST'
            WHEN customer_stats.days_since_last > 90 THEN 'AT_RISK'
            ELSE 'REGULAR'
        END as segment,
        customer_stats.total_orders,
        customer_stats.total_spent,
        customer_stats.avg_order_value,
        customer_stats.first_order,
        customer_stats.last_order,
        customer_stats.days_since_last,
        customer_stats.total_spent as lifetime_value
    FROM public.customers c
    INNER JOIN (
        SELECT
            o.customer_id,
            COUNT(*) as total_orders,
            SUM(o.total_amount) as total_spent,
            AVG(o.total_amount) as avg_order_value,
            MIN(o.created_at) as first_order,
            MAX(o.created_at) as last_order,
            EXTRACT(DAY FROM NOW() - MAX(o.created_at))::INTEGER as days_since_last
        FROM public.orders o
        WHERE o.status != 'CANCELLED'
        GROUP BY o.customer_id
    ) customer_stats ON c.id = customer_stats.customer_id;
END;
$$;

-- =====================================================
-- 7. Enable RLS and Create Policies
-- =====================================================

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_product_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_customer_segments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can read analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can read daily_sales" ON public.analytics_daily_sales;
DROP POLICY IF EXISTS "Admins can read product_performance" ON public.analytics_product_performance;
DROP POLICY IF EXISTS "Admins can read customer_segments" ON public.analytics_customer_segments;
DROP POLICY IF EXISTS "Anyone can insert analytics_events" ON public.analytics_events;

-- Create new policies
CREATE POLICY "Admins can read analytics_events" ON public.analytics_events
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can read daily_sales" ON public.analytics_daily_sales
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can read product_performance" ON public.analytics_product_performance
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can read customer_segments" ON public.analytics_customer_segments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Anyone can insert analytics_events" ON public.analytics_events
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- =====================================================
-- 8. Add Table Comments
-- =====================================================

COMMENT ON TABLE public.analytics_events IS 'User interaction events for behavioral analytics';
COMMENT ON TABLE public.analytics_daily_sales IS 'Pre-aggregated daily sales metrics';
COMMENT ON TABLE public.analytics_product_performance IS 'Product performance metrics by date';
COMMENT ON TABLE public.analytics_customer_segments IS 'Customer segmentation by purchase behavior';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see this without errors, all analytics tables have been created successfully!
-- Run this to verify: SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'analytics%';
