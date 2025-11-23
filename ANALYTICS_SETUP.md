# Analytics Database Setup Instructions

This file explains how to set up the analytics database tables for your admin dashboard.

## Prerequisites

- Access to your Supabase project dashboard
- Admin privileges on the database

## Setup Steps

### Step 1: Run the Analytics Schema

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** section (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `database/analytics_schema.sql`
5. Click **Run** to execute the script

This will create:
- `analytics_events` table for event tracking
- `analytics_daily_sales` table for pre-aggregated metrics
- `analytics_product_performance` table for product analytics
- `analytics_customer_segments` table for customer segmentation
- Helper functions for data refresh
- Proper indexes and RLS policies

### Step 2: Populate Initial Data (Optional)

If you want to populate historical analytics data, run these functions:

```sql
-- Refresh today's sales data
SELECT public.refresh_daily_sales_analytics(CURRENT_DATE);

-- Refresh yesterday's data
SELECT public.refresh_daily_sales_analytics(CURRENT_DATE - INTERVAL '1 day');

-- Refresh product performance for today
SELECT public.refresh_product_performance(CURRENT_DATE);

-- Update customer segments
SELECT public.refresh_customer_segments();
```

You can schedule these functions to run daily for continuous analytics aggregation.

### Step 3: Verify Tables Were Created

Run this query to check if all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'analytics%'
ORDER BY table_name;
```

You should see:
- analytics_customer_segments
- analytics_daily_sales
- analytics_events
- analytics_product_performance

### Step 4: Test the Analytics Dashboard

1. Save all files and ensure your dev server is running
2. Navigate to `/admin/analytics` in your browser
3. The dashboard should now display real data from your database
4. Test different timeframes (7d, 30d, 90d, 1y)
5. Verify all metrics, charts, and tables show actual data

## Troubleshooting

### No data showing in dashboard

- Ensure you have orders in your database
- Check browser console for errors
- Verify RLS policies allow your admin user to read analytics tables

### Permission errors

Make sure your authenticated user has the 'ADMIN' role:

```sql
SELECT id, email, role FROM public.users WHERE id = auth.uid();
```

If not, update the role:

```sql
UPDATE public.users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

### Slow queries

The aggregation tables (analytics_daily_sales, analytics_product_performance) are designed to make queries fast. If you have a lot of data, consider:

1. Running the refresh functions on a schedule (e.g., daily at midnight)
2. Querying from aggregation tables instead of calculating on the fly
3. Adding more indexes if needed

## Maintenance

### Daily Refresh (Recommended)

Set up a cron job or Supabase Edge Function to run daily:

```sql
-- Refresh all analytics for previous day
SELECT public.refresh_daily_sales_analytics(CURRENT_DATE - INTERVAL '1 day');
SELECT public.refresh_product_performance(CURRENT_DATE - INTERVAL '1 day');
SELECT public.refresh_customer_segments();
```

### Manual Refresh

You can manually refresh analytics anytime by running the functions in Step 2.

## What Changed

### Before
- Mock/fake data for category distributions
- Hardcoded revenue growth (0%)
- Random conversion rate calculation
- No real customer insights
- Missing service analytics
- No top products analysis

### After
- Real category distribution from order_items JOIN products
- Actual period-over-period growth calculations
- Proper conversion rate (completed orders / total orders)
- Customer segmentation (VIP, Regular, New, At Risk, Lost)
- Service request status tracking
- Top 10 products by revenue with stock levels
- Geographic distribution by wilaya
- Comprehensive business metrics

All data now comes from real database queries - no more mock data!
