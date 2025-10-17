// backend/src/lib/http.ts
// 🎯 Helpers HTTP centralisés pour éliminer la duplication dans les contrôleurs

import { Response } from 'express';

/**
 * Structure de réponse API standardisée
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Structure de pagination
 */
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

/**
 * Classe utilitaire pour les réponses HTTP standardisées
 */
export class HttpResponse {
  /**
   * Réponse de succès (200 OK)
   */
  static ok<T>(res: Response, data: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    return res.status(200).json(response);
  }

  /**
   * Réponse de création réussie (201 Created)
   */
  static created<T>(res: Response, data: T, message = 'Créé avec succès'): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(201).json(response);
  }

  /**
   * Réponse de mise à jour réussie (200 OK)
   */
  static updated<T>(res: Response, data: T, message = 'Mis à jour avec succès'): Response {
    return this.ok(res, data, message);
  }

  /**
   * Réponse de suppression réussie (200 OK)
   */
  static deleted(res: Response, message = 'Supprimé avec succès'): Response {
    const response: ApiResponse = {
      success: true,
      message,
    };
    return res.status(200).json(response);
  }

  /**
   * Réponse sans contenu (204 No Content)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Réponse d'erreur cliente (400 Bad Request)
   */
  static badRequest(res: Response, message: string): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(400).json(response);
  }

  /**
   * Réponse d'authentification requise (401 Unauthorized)
   */
  static unauthorized(res: Response, message = 'Authentification requise'): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(401).json(response);
  }

  /**
   * Réponse d'accès refusé (403 Forbidden)
   */
  static forbidden(res: Response, message = 'Accès refusé'): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(403).json(response);
  }

  /**
   * Réponse de ressource non trouvée (404 Not Found)
   */
  static notFound(res: Response, message = 'Ressource non trouvée'): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(404).json(response);
  }

  /**
   * Réponse de conflit (409 Conflict)
   */
  static conflict(res: Response, message: string): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(409).json(response);
  }

  /**
   * Réponse d'erreur serveur (500 Internal Server Error)
   */
  static serverError(res: Response, message = 'Erreur serveur', error?: unknown): Response {
    console.error('Server Error:', error);
    const response: ApiResponse = {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? message 
        : error instanceof Error 
          ? error.message 
          : message,
    };
    return res.status(500).json(response);
  }

  /**
   * Réponse d'erreur générique avec code de statut personnalisé
   */
  static error(res: Response, statusCode: number, message: string): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Réponse paginée
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response {
    const totalPages = Math.ceil(total / limit);
    
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return res.status(200).json(response);
  }
}

/**
 * Classe utilitaire pour la validation des données
 */
export class Validator {
  /**
   * Vérifie que tous les champs requis sont présents
   * @throws Error si un champ est manquant
   */
  static required(data: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      throw new Error(`Champs requis manquants: ${missing.join(', ')}`);
    }
  }

  /**
   * Vérifie qu'au moins un champ est présent
   * @throws Error si aucun champ n'est présent
   */
  static atLeastOne(data: Record<string, unknown>, fields: string[]): void {
    const present = fields.some(field => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '';
    });

    if (!present) {
      throw new Error(`Au moins un de ces champs est requis: ${fields.join(', ')}`);
    }
  }

  /**
   * Valide un email
   * @throws Error si l'email est invalide
   */
  static email(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format d\'email invalide');
    }
  }

  /**
   * Valide un numéro de téléphone (France)
   * @throws Error si le téléphone est invalide
   */
  static phone(phone: string): void {
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:\d{2}){4}$/;
    if (!phoneRegex.test(phone.replace(/[\s.-]/g, ''))) {
      throw new Error('Format de téléphone invalide');
    }
  }

  /**
   * Valide une longueur minimale
   * @throws Error si la valeur est trop courte
   */
  static minLength(value: string, min: number, fieldName = 'Champ'): void {
    if (value.length < min) {
      throw new Error(`${fieldName} doit contenir au moins ${min} caractères`);
    }
  }

  /**
   * Valide une longueur maximale
   * @throws Error si la valeur est trop longue
   */
  static maxLength(value: string, max: number, fieldName = 'Champ'): void {
    if (value.length > max) {
      throw new Error(`${fieldName} ne doit pas dépasser ${max} caractères`);
    }
  }

  /**
   * Valide une valeur numérique
   * @throws Error si la valeur n'est pas un nombre
   */
  static isNumber(value: unknown, fieldName = 'Valeur'): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${fieldName} doit être un nombre`);
    }
  }

  /**
   * Valide une valeur positive
   * @throws Error si la valeur est négative
   */
  static isPositive(value: number, fieldName = 'Valeur'): void {
    if (value < 0) {
      throw new Error(`${fieldName} doit être positif`);
    }
  }

  /**
   * Valide un enum
   * @throws Error si la valeur n'est pas dans l'enum
   */
  static isEnum<T extends string>(
    value: string, 
    allowedValues: T[], 
    fieldName = 'Valeur'
  ): void {
    if (!allowedValues.includes(value as T)) {
      throw new Error(
        `${fieldName} doit être l'une des valeurs: ${allowedValues.join(', ')}`
      );
    }
  }

  /**
   * Valide une date
   * @throws Error si la date est invalide
   */
  static isDate(value: string | Date, fieldName = 'Date'): void {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} n'est pas une date valide`);
    }
  }

  /**
   * Valide une date future
   * @throws Error si la date n'est pas dans le futur
   */
  static isFutureDate(value: string | Date, fieldName = 'Date'): void {
    this.isDate(value, fieldName);
    const date = new Date(value);
    if (date <= new Date()) {
      throw new Error(`${fieldName} doit être dans le futur`);
    }
  }
}

/**
 * Helper pour les paramètres de pagination
 */
export class PaginationHelper {
  /**
   * Parse et valide les paramètres de pagination
   */
  static parse(query: { page?: string; limit?: string }): { page: number; limit: number; offset: number } {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }
}

/**
 * Types exportés
 */
export type { ApiResponse, PaginationMeta, PaginatedResponse };