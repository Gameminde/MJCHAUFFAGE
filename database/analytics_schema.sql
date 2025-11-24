-- =====================================================
-- Analytics Database Schema
-- =====================================================
-- This script creates tables for tracking user behavior,
-- analytics events, and pre-aggregated metrics for performance
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Analytics Sessions Table
-- =====================================================
-- Tracks user sessions to group events
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.analytics_sessions CASCADE;
DROP TABLE IF EXISTS public.analytics_daily_sales CASCADE;
DROP TABLE IF EXISTS public.analytics_product_performance CASCADE;
DROP TABLE IF EXISTS public.analytics_customer_segments CASCADE;

CREATE TABLE public.analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    visitor_id TEXT, -- Fingerprint for non-logged in users
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type TEXT,
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    country TEXT,
    city TEXT
);

CREATE INDEX idx_analytics_sessions_user ON public.analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_visitor ON public.analytics_sessions(visitor_id);
CREATE INDEX idx_analytics_sessions_started ON public.analytics_sessions(started_at DESC);

-- =====================================================
-- 2. Analytics Events Table
-- =====================================================
-- Tracks all user interactions and events for analytics
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', 'purchase', 'search', etc.
    page_path TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    event_data JSONB, -- Flexible storage for event-specific data (e.g., search_term, cart_value)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics_events
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_product ON public.analytics_events(product_id) WHERE product_id IS NOT NULL;

-- =====================================================
-- 3. Aggregated Tables (for Dashboard Performance)
-- =====================================================

-- Daily Sales Aggregation
CREATE TABLE public.analytics_daily_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_analytics_daily_sales_date ON public.analytics_daily_sales(date DESC);

-- Product Performance Aggregation
CREATE TABLE public.analytics_product_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    add_to_cart INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, date)
);
CREATE INDEX idx_analytics_product_perf_product ON public.analytics_product_performance(product_id);
CREATE INDEX idx_analytics_product_perf_date ON public.analytics_product_performance(date DESC);

-- Customer Segments
CREATE TABLE public.analytics_customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    segment TEXT NOT NULL, -- 'VIP', 'REGULAR', 'NEW', 'AT_RISK', 'LOST'
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    lifetime_value DECIMAL(10, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);
CREATE INDEX idx_analytics_customer_seg_segment ON public.analytics_customer_segments(segment);

-- =====================================================
-- 4. RPC Functions (for Frontend Access)
-- =====================================================

-- Function to start a new session
CREATE OR REPLACE FUNCTION public.start_analytics_session(
    p_visitor_id TEXT,
    p_device_type TEXT DEFAULT NULL,
    p_browser TEXT DEFAULT NULL,
    p_os TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
BEGIN
    INSERT INTO public.analytics_sessions (
        user_id,
        visitor_id,
        device_type,
        browser,
        os,
        ip_address
    ) VALUES (
        auth.uid(),
        p_visitor_id,
        p_device_type,
        p_browser,
        p_os,
        p_ip_address
    )
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$;

-- Function to log an event
CREATE OR REPLACE FUNCTION public.log_analytics_event(
    p_session_id UUID,
    p_event_type TEXT,
    p_page_path TEXT DEFAULT NULL,
    p_product_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_event_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_id UUID;
BEGIN
    -- Verify session exists
    IF NOT EXISTS (SELECT 1 FROM public.analytics_sessions WHERE id = p_session_id) THEN
        RAISE EXCEPTION 'Session not found';
    END IF;

    INSERT INTO public.analytics_events (
        session_id,
        user_id,
        event_type,
        page_path,
        product_id,
        category_id,
        event_data
    ) VALUES (
        p_session_id,
        auth.uid(),
        p_event_type,
        p_page_path,
        p_product_id,
        p_category_id,
        p_event_data
    )
    RETURNING id INTO v_event_id;

    -- Update session last_active
    UPDATE public.analytics_sessions
    SET last_active_at = NOW()
    WHERE id = p_session_id;

    RETURN v_event_id;
END;
$$;

-- =====================================================
-- 5. RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_product_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_customer_segments ENABLE ROW LEVEL SECURITY;

-- Policies for Sessions
CREATE POLICY "Anyone can insert sessions" ON public.analytics_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view their own sessions" ON public.analytics_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.analytics_sessions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Events
CREATE POLICY "Anyone can insert events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view their own events" ON public.analytics_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all events" ON public.analytics_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- Policies for Aggregated Data (Admin only)
CREATE POLICY "Admins can read daily_sales" ON public.analytics_daily_sales FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins can read product_performance" ON public.analytics_product_performance FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins can read customer_segments" ON public.analytics_customer_segments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.start_analytics_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_analytics_event TO anon, authenticated;
