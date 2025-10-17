import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { JwtDurationUtil } from '../config/jwt-duration.util';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    try {
      // 1. Vérifier si l'utilisateur existe
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
        },
      });

      if (!user) {
        this.logger.warn(`Tentative de connexion avec email inexistant: ${email}`);
        throw new UnauthorizedException('Identifiants invalides');
      }

      // 2. Vérifier si l'utilisateur est actif
      if (!user.isActive) {
        this.logger.warn(`Tentative de connexion avec compte inactif: ${email}`);
        throw new UnauthorizedException('Compte désactivé');
      }

      // 3. Vérifier le mot de passe
      if (!user.password) {
        this.logger.warn(`Utilisateur sans mot de passe tente une connexion email/password: ${email}`);
        throw new UnauthorizedException('Identifiants invalides');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Tentative de connexion avec mot de passe incorrect: ${email}`);
        throw new UnauthorizedException('Identifiants invalides');
      }

      // 4. Vérifier le rôle admin
      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        this.logger.warn(`Tentative de connexion non-admin: ${email} (role: ${user.role})`);
        throw new UnauthorizedException('Accès non autorisé');
      }

      // 5. Générer les tokens JWT
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: JwtDurationUtil.toSeconds(
          this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        ),
      });

      const refreshToken = this.jwtService.sign(
        { ...payload, type: 'refresh' },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: JwtDurationUtil.toSeconds(
            this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
          ),
        },
      );

      // 6. Mettre à jour lastLoginAt
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      this.logger.log(`Connexion réussie pour: ${email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Erreur lors de la connexion pour ${email}: ${error}`);
      throw new UnauthorizedException('Erreur de connexion');
    }
  }

  async validateUser(payload: JwtPayload) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error('Erreur lors de la validation du token:', error);
      return null;
    }
  }
}
