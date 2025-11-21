# Integration Testing Suite

This directory contains comprehensive integration tests for the MJ CHAUFFAGE e-commerce platform, covering all aspects of the system including user journeys, admin-website communication, payment processing, and analytics tracking.

## Test Structure

```
tests/
├── e2e/                          # End-to-end tests using Playwright
│   ├── fixtures/                 # Test data and utilities
│   │   ├── test-data.ts         # Test data fixtures
│   │   └── test-image.jpg       # Test image file
│   ├── helpers/                  # Test helper functions
│   │   └── test-helpers.ts      # Reusable test utilities
│   ├── user-journey.spec.ts     # Complete user journey tests
│   ├── admin-website-communication.spec.ts  # Admin-website sync tests
│   ├── payment-processing.spec.ts           # Payment and order tests
│   └── analytics-tracking.spec.ts          # Analytics tracking tests
├── integration/                  # API integration tests using Vitest
│   └── api-integration.test.ts  # Comprehensive API tests
├── setup/                       # Test setup and configuration
│   └── vitest.setup.ts         # Vitest global setup
├── run-integration-tests.ts     # Test runner script
└── README.md                    # This file
```

## Test Categories

### 1. End-to-End (E2E) Tests

#### User Journey Tests (`user-journey.spec.ts`)
- **Complete purchase journey (guest user)**: Tests the entire flow from product browsing to order confirmation
- **Complete purchase journey (registered user)**: Tests authenticated user purchase flow with saved information
- **Product search and filtering**: Tests search functionality, category filters, price filters, and sorting
- **Service appointment booking**: Tests the service booking system end-to-end
- **User account management**: Tests profile updates, order history, wishlist, and address management
- **Mobile responsive experience**: Tests mobile-specific functionality and responsive design

#### Admin-Website Communication Tests (`admin-website-communication.spec.ts`)
- **Product management sync**: Tests real-time synchronization between admin product changes and website display
- **Inventory management real-time sync**: Tests stock level updates and out-of-stock handling
- **Order management and status updates**: Tests order processing workflow and status notifications
- **Service appointment management sync**: Tests appointment booking and management flow
- **Content management sync**: Tests homepage content and promotional banner updates
- **Real-time notifications and updates**: Tests WebSocket connections and live updates
- **Cache invalidation and data consistency**: Tests cache management and data consistency

#### Payment Processing Tests (`payment-processing.spec.ts`)
- **Stripe payment processing**: Tests successful payments, declined cards, and insufficient funds scenarios
- **Cash on delivery payment**: Tests COD payment method and fee calculation
- **Bank transfer payment**: Tests bank transfer instructions and reference generation
- **Order management workflow**: Tests complete order lifecycle from creation to delivery
- **Inventory management during checkout**: Tests stock deduction and availability checking
- **Multiple payment methods comparison**: Tests payment method switching and fee calculations
- **Order confirmation and notifications**: Tests email/SMS notifications and tracking links

#### Analytics Tracking Tests (`analytics-tracking.spec.ts`)
- **Page view tracking and session management**: Tests visitor tracking and session duration
- **E-commerce event tracking**: Tests product views, cart actions, and purchase conversions
- **Traffic source attribution tracking**: Tests UTM parameters, referrals, and organic traffic
- **User behavior and engagement tracking**: Tests scroll depth, time on page, and click events
- **Search and filter analytics**: Tests search queries, filter usage, and no-results scenarios
- **Analytics dashboard data verification**: Tests real-time metrics and dashboard functionality
- **Error tracking and monitoring**: Tests JavaScript errors, API errors, and 404 tracking
- **Performance metrics tracking**: Tests Core Web Vitals and page load metrics
- **Custom event tracking**: Tests business-specific events and user preferences

### 2. API Integration Tests

#### Authentication API
- User registration and login
- JWT token validation and refresh
- Password reset functionality
- Admin authentication

#### Products API
- Product listing with pagination
- Product filtering and search
- Individual product retrieval
- Product availability checking

#### Cart API
- Add/remove items from cart
- Update item quantities
- Cart persistence and retrieval
- Cart total calculations

#### Orders API
- Order creation and processing
- Order status tracking
- Order history retrieval
- Payment integration

#### Services API
- Service listing and details
- Appointment booking
- Availability checking
- Appointment management

#### Analytics API
- Event tracking endpoints
- Dashboard data retrieval
- Traffic source analysis
- Conversion funnel data

#### Admin API
- Product management (CRUD)
- Order management and status updates
- Customer management
- Dashboard statistics
- Content management

#### Real-time API
- WebSocket connection testing
- Real-time metrics retrieval
- Live update functionality

## Running Tests

### Prerequisites

1. **Backend server** must be running on `http://localhost:5000`
2. **Frontend server** must be running on `http://localhost:3000`
3. **Test database** must be set up and seeded with test data
4. **Environment variables** must be configured for testing

### Individual Test Commands

```bash
# Run all integration tests
npm run test:integration:full

# Run API integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run specific E2E test suite
npx playwright test tests/e2e/user-journey.spec.ts

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + integration + e2e)
npm run test:all
```

### Comprehensive Test Runner

The `run-integration-tests.ts` script provides a comprehensive test runner that:

1. **Sets up the test environment**
   - Creates and seeds test database
   - Clears previous test artifacts

2. **Starts backend and frontend servers**
   - Launches servers in test mode
   - Waits for servers to be ready

3. **Runs all test suites**
   - API integration tests
   - E2E test suites in sequence

4. **Generates comprehensive reports**
   - JSON report for programmatic access
   - HTML report for human review
   - Console summary with pass/fail statistics

5. **Cleans up resources**
   - Stops servers
   - Cleans up test database
   - Removes temporary files

```bash
npm run test:integration:full
```

## Test Data and Fixtures

### Test Data (`tests/e2e/fixtures/test-data.ts`)

The test suite uses predefined test data including:

- **Test users**: Regular user and admin user accounts
- **Test products**: Sample products with various categories and prices
- **Test orders**: Sample order data with different payment methods
- **Test services**: Sample services for appointment booking
- **Analytics events**: Sample analytics events for tracking tests

### Test Helpers (`tests/e2e/helpers/test-helpers.ts`)

Reusable helper functions include:

- **Authentication helpers**: Login as user/admin
- **E-commerce helpers**: Add to cart, complete checkout
- **Analytics helpers**: Track events, verify data
- **Database helpers**: Create/cleanup test data
- **Viewport helpers**: Mobile/tablet/desktop simulation
- **Performance helpers**: Measure page load times
- **Accessibility helpers**: Check WCAG compliance

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Multiple browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Parallel execution**: Tests run in parallel for faster execution
- **Automatic retries**: Failed tests are retried automatically
- **Screenshots and videos**: Captured on test failures
- **Trace collection**: Detailed execution traces for debugging

### Vitest Configuration (`vitest.config.ts`)

- **Node environment**: Suitable for API testing
- **Global setup**: Automatic test environment preparation
- **Extended timeouts**: Longer timeouts for integration tests
- **Single thread execution**: Prevents database conflicts

## Test Reports

### HTML Report

The comprehensive HTML report includes:

- **Executive summary**: Total tests, pass/fail rates, duration
- **Test suite breakdown**: Individual suite results and errors
- **Visual metrics**: Charts and graphs for easy analysis
- **Error details**: Full error messages and stack traces

### JSON Report

Machine-readable JSON report for CI/CD integration:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalTests": 45,
    "passed": 43,
    "failed": 2,
    "successRate": 95.6,
    "totalDuration": 120000
  },
  "suites": [...]
}
```

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Integration Tests
on: [push, pull_request]
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration:full
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: tests/test-results/
```

### Test Environment Variables

Required environment variables for testing:

```bash
NODE_ENV=test
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://test:test@localhost:5432/mjchauffage_test
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
JWT_SECRET=test_jwt_secret_key
```

## Best Practices

### Test Organization

1. **Group related tests**: Use `describe` blocks to group related functionality
2. **Clear test names**: Use descriptive test names that explain what is being tested
3. **Setup and teardown**: Use `beforeEach`/`afterEach` for test isolation
4. **Data independence**: Each test should be independent and not rely on other tests

### Test Data Management

1. **Use fixtures**: Centralize test data in fixture files
2. **Generate unique data**: Use timestamps or UUIDs to avoid conflicts
3. **Clean up**: Always clean up test data after tests complete
4. **Realistic data**: Use realistic test data that matches production scenarios

### Error Handling

1. **Expect failures**: Test both success and failure scenarios
2. **Meaningful assertions**: Use specific assertions that provide clear error messages
3. **Timeout handling**: Set appropriate timeouts for async operations
4. **Retry logic**: Implement retry logic for flaky operations

### Performance Considerations

1. **Parallel execution**: Run tests in parallel when possible
2. **Resource cleanup**: Always clean up resources to prevent memory leaks
3. **Selective testing**: Use test filters to run only relevant tests during development
4. **Caching**: Cache test data and setup when appropriate

## Troubleshooting

### Common Issues

1. **Server not ready**: Increase wait times in `waitForServers()`
2. **Database conflicts**: Ensure test database is properly isolated
3. **Port conflicts**: Check that required ports (3000, 5000) are available
4. **Authentication failures**: Verify test user credentials are correct
5. **Timeout errors**: Increase test timeouts for slow operations

### Debug Mode

Run tests in debug mode for detailed troubleshooting:

```bash
# Debug E2E tests
npm run test:e2e:debug

# Debug with headed browser
npm run test:e2e:headed

# Debug API tests with verbose output
npm run test:integration -- --reporter=verbose
```

### Log Analysis

Check test logs for detailed error information:

- **Playwright traces**: Available in `test-results/` directory
- **Screenshots**: Captured on test failures
- **Console logs**: Browser console output captured during tests
- **Network logs**: HTTP requests and responses logged

## Contributing

When adding new tests:

1. **Follow naming conventions**: Use descriptive file and test names
2. **Add documentation**: Document complex test scenarios
3. **Update fixtures**: Add new test data to fixture files
4. **Test isolation**: Ensure new tests don't interfere with existing ones
5. **Performance impact**: Consider the performance impact of new tests

### Test Review Checklist

- [ ] Tests cover both success and failure scenarios
- [ ] Test data is properly managed and cleaned up
- [ ] Tests are independent and can run in any order
- [ ] Error messages are clear and actionable
- [ ] Performance impact is acceptable
- [ ] Documentation is updated