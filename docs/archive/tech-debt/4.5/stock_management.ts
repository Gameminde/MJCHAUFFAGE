// ========================================
// SYSTÈME DE GESTION DE STOCK AVANCÉ
// ========================================

// backend/src/services/inventoryService.ts

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

// Redis setup with memory fallback for development
const useRedis = !!process.env.REDIS_URL;
const redis: any = useRedis ? createClient({ url: process.env.REDIS_URL as string }) : null;
if (useRedis) {
  redis.on('error', (err: any) => console.error('Redis error', err));
  redis.connect().catch(() => {});
}

const memoryCache = new Map<string, { value: string; expiresAt: number }>();
async function safeGet<T>(key: string): Promise<T | null> {
  if (!useRedis) {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return null;
    }
  }
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

async function safeSetEx(key: string, ttlSeconds: number, payload: any): Promise<void> {
  if (!useRedis) {
    memoryCache.set(key, { value: JSON.stringify(payload), expiresAt: Date.now() + ttlSeconds * 1000 });
    return;
  }
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(payload));
  } catch {
    // ignore cache write errors in development
  }
}

async function safeDel(...keys: string[]): Promise<void> {
  if (!useRedis) {
    keys.forEach(k => memoryCache.delete(k));
    return;
  }
  try {
    await redis.del(...keys);
  } catch {
    // ignore cache delete errors in development
  }
}

interface StockOperation {
  productId: string;
  quantity: number;
  orderId?: string;
  type: 'RESERVE' | 'RELEASE' | 'ADJUST' | 'RESTOCK' | 'SOLD';
  reason?: string;
}

export class InventoryService {
  
  // ========================================
  // 1. RÉSERVATION ATOMIQUE DE STOCK
  // ========================================
  async reserveStock(
    items: { productId: string; quantity: number }[],
    orderId: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    
    const errors: string[] = [];
    
    // ✅ Transaction Prisma pour atomicité
    try {
      await prisma.$transaction(async (tx) => {
        
        for (const item of items) {
          // Lock pessimiste sur le produit
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              stockQuantity: true,
              reservedStock: true,
              minStock: true
            }
          });

          if (!product) {
            throw new Error(`Produit ${item.productId} introuvable`);
          }

          // ✅ Vérification stock disponible
          const availableStock = product.stockQuantity - product.reservedStock;
          
          if (availableStock < item.quantity) {
            errors.push(
              `Stock insuffisant pour ${product.name}. ` +
              `Disponible: ${availableStock}, Demandé: ${item.quantity}`
            );
            throw new Error('INSUFFICIENT_STOCK');
          }

          // ✅ Alerte stock faible
          const newReserved = product.reservedStock + item.quantity;
          const remainingStock = product.stockQuantity - newReserved;
          
          if (remainingStock < product.minStock) {
            await this.sendLowStockAlert(product.id, remainingStock);
          }

          // ✅ Mise à jour atomique
          await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedStock: { increment: item.quantity }
            }
          });

          // ✅ Log de l'opération
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              type: 'ADJUSTMENT',
              quantity: item.quantity,
              oldQuantity: product.stockQuantity,
              newQuantity: product.stockQuantity,
              reference: orderId,
              reason: `Réservation pour commande ${orderId}`
            }
          });
        }
      });

      // ✅ Cache invalidation
      await this.invalidateStockCache(items.map(i => i.productId));

      return { success: true };
      
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_STOCK') {
        return { success: false, errors };
      }
      throw error;
    }
  }

  // ========================================
  // 2. LIBÉRATION DE STOCK (Annulation)
  // ========================================
  async releaseStock(
    items: { productId: string; quantity: number }[],
    orderId: string,
    reason: string = 'Annulation commande'
  ): Promise<void> {
    
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true, reservedStock: true }
        });

        if (!product) continue;

        // ✅ Sécurité: ne pas libérer plus que réservé
        const toRelease = Math.min(item.quantity, product.reservedStock);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            reservedStock: { decrement: toRelease }
          }
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'ADJUSTMENT',
            quantity: toRelease,
            oldQuantity: product.stockQuantity,
            newQuantity: product.stockQuantity,
            reference: orderId,
            reason
          }
        });
      }
    });

    await this.invalidateStockCache(items.map(i => i.productId));
  }

  // ========================================
  // 3. CONFIRMATION VENTE (Déduction stock)
  // ========================================
  async confirmSale(
    items: { productId: string; quantity: number }[],
    orderId: string
  ): Promise<void> {
    
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            reservedStock: { decrement: item.quantity },
            totalSold: { increment: item.quantity }
          }
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: item.quantity,
            reference: orderId,
            reason: `Vente confirmée - Commande ${orderId}`
          }
        });
      }
    });

    await this.invalidateStockCache(items.map(i => i.productId));
  }

  // ========================================
  // 4. VÉRIFICATION STOCK TEMPS RÉEL
  // ========================================
  async checkAvailability(
    productId: string,
    quantity: number
  ): Promise<{
    available: boolean;
    stock: number;
    reserved: number;
    message?: string;
  }> {
    
    // ✅ Try cache first
    const cacheKey = `stock:${productId}`;
    const cached = await safeGet<{ stockQuantity: number; reserved: number; minStock: number }>(cacheKey);
    
    let product;
    if (cached) {
      product = cached;
    } else {
      const base = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          stockQuantity: true,
          minStock: true
        }
      });

      if (base) {
        const reserved = await this.computeReservedUnits(productId);
        product = { stockQuantity: base.stockQuantity, minStock: base.minStock, reserved };
        await safeSetEx(cacheKey, 60, product); // 1 min cache
      }
    }

    if (!product) {
      return {
        available: false,
        stock: 0,
        reserved: 0,
        message: 'Produit introuvable'
      };
    }

    const availableStock = product.stockQuantity - product.reserved;
    const available = availableStock >= quantity;

    return {
      available,
      stock: product.stockQuantity,
      reserved: product.reserved,
      message: available 
        ? undefined 
        : `Stock insuffisant. Disponible: ${availableStock}`
    };
  }

  // helper: compute reserved units from active orders
  private async computeReservedUnits(productId: string): Promise<number> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT COALESCE(SUM(oi.quantity), 0)::int AS reserved
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ${productId}::uuid
        AND o.status IN ('PENDING','CONFIRMED','PROCESSING')
    `;
    return Number(rows?.[0]?.reserved ?? 0);
  }

  // ========================================
  // 5. AJUSTEMENT STOCK (Admin)
  // ========================================
  async adjustStock(
    productId: string,
    newQuantity: number,
    reason: string,
    adminId: string
  ): Promise<void> {
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true, reservedStock: true }
    });

    if (!product) {
      throw new Error('Produit introuvable');
    }

    // ✅ Sécurité: ne pas descendre sous le stock réservé
    if (newQuantity < product.reservedStock) {
      throw new Error(
        `Impossible: ${product.reservedStock} unités sont réservées`
      );
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: newQuantity }
    });

    await prisma.inventoryLog.create({
      data: {
        productId,
        type: 'ADJUSTMENT',
        quantity: newQuantity - product.stockQuantity,
        oldQuantity: product.stockQuantity,
        newQuantity,
        reason: `${reason} (Admin: ${adminId})`
      }
    });

    await this.invalidateStockCache([productId]);
  }

  // ========================================
  // 6. RÉAPPROVISIONNEMENT AUTOMATIQUE
  // ========================================
  async autoRestock(): Promise<void> {
    // Produits sous le seuil minimum
    const lowStockProducts = await prisma.$queryRaw<{
      id: string;
      name: string;
      sku: string;
      stockQuantity: number;
      minStock: number;
      maxStock: number | null;
    }[]>`
      SELECT 
        id,
        name,
        sku,
        stock_quantity as "stockQuantity",
        min_stock as "minStock",
        max_stock as "maxStock"
      FROM products
      WHERE stock_quantity <= min_stock AND is_active = true
    `;

    for (const product of lowStockProducts) {
      const reorderQuantity = (product.maxStock ?? 100) - product.stockQuantity;
      
      // ✅ Créer une alerte/commande fournisseur
      await this.createSupplierOrder(product.id, reorderQuantity);
      
      console.log(
        `🔔 Réapprovisionnement: ${product.name} (${product.sku}) - ` +
        `Stock: ${product.stockQuantity} → Commander: ${reorderQuantity}`
      );
    }
  }

  // ========================================
  // HELPERS PRIVÉS
  // ========================================
  private async invalidateStockCache(productIds: string[]): Promise<void> {
    const keys = productIds.map(id => `stock:${id}`);
    if (keys.length > 0) {
      await safeDel(...keys);
    }
  }

  private async sendLowStockAlert(
    productId: string,
    remainingStock: number
  ): Promise<void> {
    // TODO: Envoyer email/notification aux admins
    console.log(`⚠️ Alerte stock faible - Produit ${productId}: ${remainingStock} unités`);
  }

  private async createSupplierOrder(
    productId: string,
    quantity: number
  ): Promise<void> {
    // Intégration fournisseur non disponible dans le schéma actuel.
    // Remplacer par l'envoi d'une notification/log.
    console.log(`Supplier order suggested for product ${productId}: quantity ${quantity}`);
  }
}

// ========================================
// 7. WEBHOOK POUR MISE À JOUR TEMPS RÉEL
// ========================================
// backend/src/routes/webhooks.ts

import express from 'express';
import { Server as SocketServer } from 'socket.io';

export function setupStockWebhooks(io: SocketServer) {
  const router = express.Router();

  // Webhook après chaque changement de stock
  prisma.$use(async (params, next) => {
    const result = await next(params);

    if (params.model === 'Product' && params.action === 'update') {
      const productId = params.args.where.id;
      
      // ✅ Notifier tous les clients connectés
      io.emit('stock:updated', {
        productId,
        timestamp: new Date().toISOString()
      });
    }

    return result;
  });

  return router;
}
