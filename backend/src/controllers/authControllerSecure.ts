import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '@/lib/database';
import { 
  SecureTokenManager, 
  SecurePasswordManager, 
  ValidationSchemas, 
  validateBody,
  SecurityLogger,
  authRateLimit
} from '@/middleware/securityEnhanced';

export class AuthControllerSecure {
  /**
   * Connexion sécurisée avec rate limiting et validation
   */
  static login = [
    authRateLimit,
    validateBody(ValidationSchemas.loginSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password } = req.body;
        const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';

        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isVerified: true,
            lastLoginAt: true
          }
        });

        if (!user) {
          SecurityLogger.logAuthAttempt(clientIP, email, false);
          res.status(401).json({
            error: 'Identifiants invalides',
            code: 'INVALID_CREDENTIALS'
          });
          return;
        }

        if (!user.isActive) {
          SecurityLogger.logAuthAttempt(clientIP, email, false);
          res.status(401).json({
            error: 'Compte désactivé',
            code: 'ACCOUNT_DISABLED'
          });
          return;
        }

        if (!user.isVerified) {
          SecurityLogger.logAuthAttempt(clientIP, email, false);
          res.status(401).json({
            error: 'Email non vérifié',
            code: 'EMAIL_NOT_VERIFIED'
          });
          return;
        }

        // Vérifier le mot de passe
        if (!user.password) {
          SecurityLogger.logAuthAttempt(clientIP, email, false);
          res.status(401).json({
            error: 'Identifiants invalides',
            code: 'INVALID_CREDENTIALS'
          });
          return;
        }
        
        const isValidPassword = await SecurePasswordManager.verifyPassword(password, user.password);
        
        if (!isValidPassword) {
          SecurityLogger.logAuthAttempt(clientIP, email, false);
          res.status(401).json({
            error: 'Identifiants invalides',
            code: 'INVALID_CREDENTIALS'
          });
          return;
        }

        // Générer les tokens sécurisés
        const tokens = SecureTokenManager.generateTokenPair(user);

        // Mettre à jour la dernière connexion
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        SecurityLogger.logAuthAttempt(clientIP, email, true);

        res.json({
          message: 'Connexion réussie',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          },
          tokens
        });

      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
          error: 'Erreur serveur',
          code: 'SERVER_ERROR'
        });
      }
    }
  ];

  /**
   * Inscription sécurisée avec validation renforcée
   */
  static register = [
    validateBody(ValidationSchemas.createUserSchema),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
          return;
        }

        const { email, password, firstName, lastName, companyName, customerType = 'B2C' } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (existingUser) {
          res.status(409).json({
            success: false,
            message: 'Un utilisateur avec cet email existe déjà',
          });
          return;
        }

        // Hash sécurisé du mot de passe
        const hashedPassword = await SecurePasswordManager.hashPassword(password);

        // Créer l'utilisateur et le client dans une transaction
        const result = await prisma.$transaction(async (tx: any) => {
          const user = await tx.user.create({
            data: {
              email: email.toLowerCase(),
              firstName,
              lastName,
              password: hashedPassword,
              role: 'CUSTOMER',
              isVerified: false, // Nécessite une vérification email
            },
          });

          const customer = await tx.customer.create({
            data: {
              userId: user.id,
              companyName: companyName || null,
              customerType: customerType as 'B2B' | 'B2C',
            },
          });

          return { user, customer };
        });

        // Log de l'inscription
        const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
        SecurityLogger.logAuthAttempt(clientIP, email, true);

        res.status(201).json({
          success: true,
          message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
          },
        });

      } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur serveur',
        });
      }
    }
  ];

  /**
   * Refresh token sécurisé
   */
  static refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          error: 'Refresh token requis',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }

      // Vérifier le refresh token
      const decoded = SecureTokenManager.verifyRefreshToken(refreshToken);

      // Vérifier que l'utilisateur existe toujours
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          error: 'Utilisateur non trouvé ou désactivé',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      // Générer de nouveaux tokens
      const tokens = SecureTokenManager.generateTokenPair(user);

      res.json({
        message: 'Tokens renouvelés avec succès',
        tokens
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        error: 'Refresh token invalide ou expiré',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  };

  /**
   * Déconnexion sécurisée
   */
  static logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // En production, ajouter le token à une blacklist
      // ou invalider le refresh token en base
      
      const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
      const userId = req.user?.id || 'unknown';
      
      SecurityLogger.logAdminAction(userId, 'LOGOUT', clientIP);

      res.json({
        message: 'Déconnexion réussie'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        code: 'SERVER_ERROR'
      });
    }
  };

  /**
   * Vérification du profil utilisateur
   */
  static getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        res.status(404).json({
          error: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        code: 'SERVER_ERROR'
      });
    }
  };

  /**
   * Changement de mot de passe sécurisé
   */
  static changePassword = [
    validateBody(z.object({
      currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
      newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    })),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
          res.status(401).json({
            error: 'Authentification requise',
            code: 'AUTH_REQUIRED'
          });
          return;
        }

        // Récupérer l'utilisateur avec son mot de passe
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            password: true
          }
        });

        if (!user) {
          res.status(404).json({
            error: 'Utilisateur non trouvé',
            code: 'USER_NOT_FOUND'
          });
          return;
        }

        // Vérifier le mot de passe actuel
        if (!user.password) {
          res.status(400).json({
            error: 'Mot de passe non défini',
            code: 'PASSWORD_NOT_SET'
          });
          return;
        }
        
        const isCurrentPasswordValid = await SecurePasswordManager.verifyPassword(
          currentPassword, 
          user.password
        );

        if (!isCurrentPasswordValid) {
          res.status(400).json({
            error: 'Mot de passe actuel incorrect',
            code: 'INVALID_CURRENT_PASSWORD'
          });
          return;
        }

        // Hash du nouveau mot de passe
        const hashedNewPassword = await SecurePasswordManager.hashPassword(newPassword);

        // Mettre à jour le mot de passe
        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword }
        });

        // Log de l'action
        const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
        SecurityLogger.logAdminAction(userId, 'PASSWORD_CHANGE', clientIP);

        res.json({
          message: 'Mot de passe modifié avec succès'
        });

      } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
          error: 'Erreur serveur',
          code: 'SERVER_ERROR'
        });
      }
    }
  ];
}

// Import manquant pour la validation du changement de mot de passe
import { z } from 'zod';
