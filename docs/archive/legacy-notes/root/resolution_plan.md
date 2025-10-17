# TypeScript Error Resolution Plan

## Phase 1: Critical Errors (adminService.ts)

### File: src/services/adminService.ts
**Errors: 21**

### Tasks:
1. Fix undefined property access in Prisma groupBy results
2. Add proper null checks for `_sum` and `_count` properties
3. Handle division by zero in average calculations

### Implementation:
```typescript
// Before
revenue: Number(item._sum.totalAmount || 0)
orders: item._count.id

// After
revenue: Number(item._sum?.totalAmount || 0)
orders: item._count?.id || 0

// Before (division)
salesData.reduce((sum, item) => sum + item._count.id, 0)

// After (with protection)
Math.max(1, salesData.reduce((sum, item) => sum + (item._count?.id || 0), 0))
```

## Phase 2: Model Field Corrections (orderController.ts)

### File: src/controllers/orderController.ts
**Errors: 15**

### Tasks:
1. Remove `paymentMethod` field references (doesn't exist in Order model)
2. Update OrderData interface
3. Fix validation logic

### Implementation:
```typescript
// Remove from interface
interface OrderData {
  // paymentMethod: string  <- REMOVE THIS
}

// Update validation
// if (!orderData.shippingAddress || !orderData.paymentMethod) {  <- REMOVE paymentMethod check
if (!orderData.shippingAddress) {
```

## Phase 3: Authentication Issues

### Files: Multiple auth-related files
**Errors: 13 total**

### Tasks:
1. Fix JWT configuration type issues
2. Remove unused imports
3. Handle optional fields in database operations

### Implementation:
```typescript
// JWT sign with proper typing
const accessToken = jwt.sign(payload, config.jwt.secret, {
  expiresIn: config.jwt.expiresIn,
} as jwt.SignOptions);

// Handle optional fields in Prisma create
await prisma.userSession.create({
  data: {
    userId,
    sessionToken,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
});
```

## Phase 4: Analytics and Data Processing

### Files: analyticsController.ts, analyticsService.ts
**Errors: 7**

### Tasks:
1. Fix incorrect field names in Prisma groupBy operations
2. Correct data access patterns

### Implementation:
```typescript
// Before - incorrect field
by: ['shippingAddress'],

// After - correct field
by: ['addressId'],
```

## Phase 5: Cleanup and Minor Issues

### Files: Various
**Errors: 8**

### Tasks:
1. Remove unused imports
2. Fix minor type mismatches
3. Address remaining TS6133 errors

## Execution Order

1. **adminService.ts** - Highest impact, most errors
2. **orderController.ts** - Model field corrections
3. **AuthService.ts** - JWT configuration
4. **Analytics files** - Data processing corrections
5. **Cleanup** - Unused imports and minor issues

## Verification Steps

After each phase:
1. Run `npx tsc --noEmit` to check for remaining errors
2. If errors = 0, proceed to next phase
3. If errors remain, address remaining issues in current phase

## Expected Outcome

After completing all phases:
- 0 TypeScript compilation errors
- Backend server starts successfully
- All API endpoints function correctly
- Database operations work as expected

## Time Estimate

- Phase 1: 30-45 minutes
- Phase 2: 20-30 minutes
- Phase 3: 15-20 minutes
- Phase 4: 15-20 minutes
- Phase 5: 10-15 minutes

**Total: 1.5-2 hours**
