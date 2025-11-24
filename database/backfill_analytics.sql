-- =====================================================
-- Backfill Analytics Data
-- =====================================================
-- This script populates the analytics tables with historical data
-- from the orders, order_items, and customers tables.

DO $$
DECLARE
    d DATE;
BEGIN
    RAISE NOTICE 'Starting analytics backfill...';

    -- 1. Refresh Customer Segments
    RAISE NOTICE 'Refreshing customer segments...';
    PERFORM public.refresh_customer_segments();

    -- 2. Loop through the last 365 days to populate daily sales and product performance
    RAISE NOTICE 'Backfilling daily sales and product performance for the last year...';
    
    FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day')::DATE
    LOOP
        -- Refresh daily sales for the specific date
        PERFORM public.refresh_daily_sales_analytics(d);
        
        -- Refresh product performance for the specific date
        PERFORM public.refresh_product_performance(d);
    END LOOP;

    RAISE NOTICE 'Backfill completed successfully.';
END $$;
