import 'dotenv/config';
import { AnalyticsService } from '../../4.5/analytics_system';

async function main() {
  const svc = new AnalyticsService();

  const overview = await svc.getOverviewMetrics();
  const sales = await svc.getSalesAnalytics('month');
  const products = await svc.getProductAnalytics();
  const customers = await svc.getCustomerAnalytics();
  const inventory = await svc.getInventoryAnalytics();

  console.log(
    JSON.stringify(
      { overview, sales, products, customers, inventory },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error('Error executing analytics:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));