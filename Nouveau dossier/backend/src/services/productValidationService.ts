/**
 * Product Validation Service
 * Service centralisé pour la validation de stock et disponibilité produits
 * Élimine les duplications entre orderService et cartService
 */

import { prisma } from '../lib/database';

// Simple error class for validation errors
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ProductValidationResult {
  isValid: boolean;
  product?: any;
  error?: string;
  availableStock?: number;
}

export interface StockValidationResult {
  isValid: boolean;
  errors: Array<{
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
    message: string;
  }>;
}

class ProductValidationService {
  /**
   * Valide qu'un produit existe et est disponible
   * @param productId ID du produit
   * @param requestedQuantity Quantité demandée
   * @returns Résultat de validation
   */
  async validateProductAvailability(
    productId: string,
    requestedQuantity: number
  ): Promise<ProductValidationResult> {
    try {
      // Vérifier que le produit existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          isActive: true,
          price: true,
          salePrice: true,
        },
      });

      if (!product) {
        return {
          isValid: false,
          error: `Produit avec ID ${productId} non trouvé`,
        };
      }

      // Vérifier que le produit est actif
      if (!product.isActive) {
        return {
          isValid: false,
          product,
          error: `Le produit "${product.name}" n'est plus disponible`,
        };
      }

      // Vérifier le stock disponible
      if (product.stockQuantity < requestedQuantity) {
        return {
          isValid: false,
          product,
          availableStock: product.stockQuantity,
          error: `Stock insuffisant pour "${product.name}". Disponible: ${product.stockQuantity}, Demandé: ${requestedQuantity}`,
        };
      }

      return {
        isValid: true,
        product,
        availableStock: product.stockQuantity,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la validation du produit: ${(error as Error).message}`);
    }
  }

  /**
   * Valide le stock pour plusieurs produits (commande ou panier)
   * @param items Liste des items avec productId et quantity
   * @returns Résultat de validation avec liste des erreurs
   */
  async validateMultipleProductsStock(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<StockValidationResult> {
    const errors: StockValidationResult['errors'] = [];

    for (const item of items) {
      const validation = await this.validateProductAvailability(
        item.productId,
        item.quantity
      );

      if (!validation.isValid) {
        errors.push({
          productId: item.productId,
          productName: validation.product?.name || 'Produit inconnu',
          requestedQuantity: item.quantity,
          availableStock: validation.availableStock || 0,
          message: validation.error || 'Erreur de validation',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Réserve temporairement du stock (lors de la création de commande)
   * @param productId ID du produit
   * @param quantity Quantité à réserver
   * @returns Produit mis à jour
   */
  async reserveStock(productId: string, quantity: number) {
    try {
      // Vérifier d'abord la disponibilité
      const validation = await this.validateProductAvailability(productId, quantity);

      if (!validation.isValid) {
        throw new ValidationError(
          validation.error || 'Validation échouée'
        );
      }

      // Décrémenter le stock
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            decrement: quantity,
          },
        },
      });

      return updatedProduct;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Erreur lors de la réservation du stock: ${(error as Error).message}`
      );
    }
  }

  /**
   * Libère du stock (lors d'une annulation de commande)
   * @param productId ID du produit
   * @param quantity Quantité à libérer
   * @returns Produit mis à jour
   */
  async releaseStock(productId: string, quantity: number) {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            increment: quantity,
          },
        },
      });

      return updatedProduct;
    } catch (error) {
      throw new ValidationError(
        `Erreur lors de la libération du stock: ${(error as Error).message}`
      );
    }
  }

  /**
   * Vérifie si un produit est en stock faible
   * @param productId ID du produit
   * @param threshold Seuil de stock faible (défaut: 10)
   * @returns true si stock faible
   */
  async isLowStock(productId: string, threshold: number = 10): Promise<boolean> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stockQuantity: true },
      });

      if (!product) {
        return false;
      }

      return product.stockQuantity <= threshold;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient la liste des produits en rupture de stock
   * @returns Liste des produits avec stock = 0
   */
  async getOutOfStockProducts() {
    try {
      return await prisma.product.findMany({
        where: {
          stockQuantity: 0,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
        },
      });
    } catch (error) {
      throw new ValidationError(
        `Erreur lors de la récupération des produits en rupture: ${(error as Error).message}`
      );
    }
  }

  /**
   * Obtient la liste des produits en stock faible
   * @param threshold Seuil de stock faible (défaut: 10)
   * @returns Liste des produits avec stock faible
   */
  async getLowStockProducts(threshold: number = 10) {
    try {
      return await prisma.product.findMany({
        where: {
          stockQuantity: {
            gt: 0,
            lte: threshold,
          },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
        },
        orderBy: {
          stockQuantity: 'asc',
        },
      });
    } catch (error) {
      throw new ValidationError(
        `Erreur lors de la récupération des produits en stock faible: ${(error as Error).message}`
      );
    }
  }
}

// Export the class for static usage
export { ProductValidationService };

// Export singleton instance
export const productValidationService = new ProductValidationService();
export default productValidationService;

