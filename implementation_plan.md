# Implementation Plan - Enhanced Admin Dashboard

## Goal Description
Build a high-performance, visually professional analytics dashboard at `/admin/analytics` using Next.js Server Components, Recharts, and Tailwind CSS. The dashboard will visualize key business metrics, conversion funnels, and real-time visitor data derived from the newly implemented analytics tables.

## User Review Required
> [!IMPORTANT]
> Ensure `recharts` is installed. If not, I will install it.
> The "Live Visitors" metric relies on `last_active_at` being updated frequently. The current implementation updates it on every event, which is sufficient.

## Proposed Changes

### Backend / Services
#### [NEW] [analyticsDashboardService.ts](file:///c:/Users/youcefcheriet/MJ_NEW/frontend/src/services/analyticsDashboardService.ts)
- Create a server-side service to aggregate data.
- **Functions**:
    - `getDashboardMetrics(dateRange)`: Returns Revenue, AOV, Conversion Rate, Live Visitors.
    - `getConversionFunnel(dateRange)`: Aggregates counts for funnel steps.
    - `getRevenueTrend(dateRange)`: Returns daily revenue data.
    - `getDeviceBreakdown(dateRange)`: Aggregates session device types.

### UI Components (Client)
#### [NEW] [AnalyticsCharts.tsx](file:///c:/Users/youcefcheriet/MJ_NEW/frontend/src/components/admin/analytics/AnalyticsCharts.tsx)
- Modular Recharts components:
    - `RevenueTrendChart`: AreaChart for revenue.
    - `ConversionFunnelChart`: BarChart for funnel.
    - `DeviceBreakdownChart`: Pie/Donut chart for devices.

#### [NEW] [AnalyticsCards.tsx](file:///c:/Users/youcefcheriet/MJ_NEW/frontend/src/components/admin/analytics/AnalyticsCards.tsx)
- Bento Grid layout components for KPI cards.
- Support for "trend" indicators (green/red arrows).

### Pages
#### [MODIFY] [page.tsx](file:///c:/Users/youcefcheriet/MJ_NEW/frontend/src/app/admin/analytics/page.tsx)
- Convert to Server Component (if not already).
- Fetch data using `analyticsDashboardService`.
- Render the dashboard layout with the new components.
- Add Date Range Picker (client component wrapper if needed).

## Verification Plan
### Automated Tests
- None planned for this UI-heavy task.

### Manual Verification
- **Visual Check**: Verify the Bento Grid layout and chart rendering.
- **Data Accuracy**: Compare dashboard numbers with SQL queries (e.g., `SELECT COUNT(*) FROM analytics_sessions`).
- **Interactivity**: Test the Date Range Filter.
- **Real-time**: Open a new incognito window and verify "Live Visitors" count increases.
