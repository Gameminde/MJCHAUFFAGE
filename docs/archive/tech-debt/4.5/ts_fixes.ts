// ========================================
// 1. ADMIN SERVICE - Corrections Prisma Aggregation
// ========================================
// backend/src/controllers/adminController.ts

// ❌ AVANT (21 erreurs)
const revenue = await prisma.order.aggregate({
  _sum: { totalAmount: true }
});
const total = revenue._sum.totalAmount; // ❌ Peut être null

// ✅ APRÈS
const revenue = await prisma.order.aggregate({
  _sum: { totalAmount: true },
  where: { status: 'COMPLETED' }
});
const total = revenue._sum.totalAmount ?? 0; // ✅ Gestion du null

// ========================================
// 2. ORDER CONTROLLER - Relations optionnelles
// ========================================
// backend/src/controllers/orderController.ts

// ❌ AVANT (15 erreurs)
const order = await prisma.order.findUnique({
  where: { id },
  include: { payment: true }
});
return {
  paymentMethod: order.payment.method, // ❌ payment peut être null
  paymentStatus: order.payment.status
};

// ✅ APRÈS
const order = await prisma.order.findUnique({
  where: { id },
  include: { payment: true }
});

if (!order) {
  throw new Error('Order not found');
}

return {
  paymentMethod: order.payment?.method ?? 'PENDING',
  paymentStatus: order.payment?.status ?? 'PENDING',
  hasPayment: !!order.payment
};

// ========================================
// 3. AUTH CONTROLLER - Champs optionnels
// ========================================
// backend/src/controllers/authController.ts

// ❌ AVANT (8 erreurs)
await prisma.session.create({
  data: {
    userId: user.id,
    ipAddress: req.ip,        // ❌ string | undefined
    userAgent: req.headers['user-agent']  // ❌ string | undefined
  }
});

// ✅ APRÈS
await prisma.session.create({
  data: {
    userId: user.id,
    ipAddress: req.ip ?? 'unknown',
    userAgent: req.headers['user-agent'] ?? 'unknown',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
});

// ========================================
// 4. Type Guards pour sécurité runtime
// ========================================
// backend/src/utils/typeGuards.ts (NOUVEAU FICHIER)

export function isValidOrder(order: any): order is Order {
  return (
    order &&
    typeof order.id === 'string' &&
    typeof order.status === 'string' &&
    typeof order.totalAmount === 'number'
  );
}

export function hasPayment(order: Order): order is Order & { payment: Payment } {
  return order.payment !== null && order.payment !== undefined;
}

// Utilisation:
const order = await getOrder(id);
if (!isValidOrder(order)) {
  throw new Error('Invalid order data');
}

if (hasPayment(order)) {
  // TypeScript sait maintenant que order.payment existe
  console.log(order.payment.method);
}
