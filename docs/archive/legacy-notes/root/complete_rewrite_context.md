# 🚀 CONTEXT D'INGÉNIERIE - RÉÉCRITURE COMPLÈTE DASHBOARD ADMIN

## ✅ PHASE 0 : AUDIT TERMINÉ

### Résultats de l'audit
```
✅ Backend : 13 contrôleurs, 15 services, architecture incohérente
✅ Frontend : 6 pages, pas de state management, validation défaillante
✅ Problèmes : Duplication massive, architecture cassée, sécurité compromise
✅ Conclusion : RÉÉCRITURE OBLIGATOIRE
```

---

## 🎯 PHASE 1 : BACKEND NESTJS MODERNE (7 jours)

### Objectif
Créer un backend admin professionnel, sécurisé et maintenable avec NestJS

---

### JOUR 1 : SETUP & AUTHENTIFICATION

#### 1.1 Créer le projet NestJS

```bash
# Créer un nouveau dossier à la racine du projet
cd /path/to/project
mkdir admin-v2
cd admin-v2

# Créer le backend NestJS
npx @nestjs/cli new admin-backend
cd admin-backend

# Choisir npm comme package manager
# Attendre l'installation...
```

#### 1.2 Installer les dépendances essentielles

```bash
# Auth & Security
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcryptjs
npm install @nestjs/config

# Database
npm install @prisma/client
npm install -D prisma

# Validation
npm install class-validator class-transformer

# Security
npm install helmet compression

# Types
npm install -D @types/bcryptjs @types/passport-jwt
```

#### 1.3 Copier le schéma Prisma

```bash
# Copier le schéma existant
mkdir prisma
cp ../../backend/prisma/schema.prisma ./prisma/

# Générer le client Prisma
npx prisma generate
```

#### 1.4 Configuration de base

**Fichier : `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
```

**Fichier : `.env`**

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="mj-chauffage-admin-v2-super-secret-key-32-chars-minimum"
JWT_REFRESH_SECRET="mj-chauffage-admin-v2-refresh-secret-key-32-chars-minimum"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3002
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

#### 1.5 Service Prisma

**Créer le module Prisma :**

```bash
nest g module prisma
nest g service prisma
```

**Fichier : `src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connecté à la base de données');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Fichier : `src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### 1.6 Module d'authentification

**Créer les fichiers :**

```bash
nest g module auth
nest g service auth
nest g controller auth
```

**Fichier : `src/auth/dto/login.dto.ts`**

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}
```

**Fichier : `src/auth/auth.service.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    // 1. Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // 2. Vérifier le mot de passe
    const validPassword = await bcrypt.compare(loginDto.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // 3. Vérifier le rôle admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new UnauthorizedException('Accès admin requis');
    }

    // 4. Générer les tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // 5. Mettre à jour lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 6. Retourner la réponse
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }
}
```

**Fichier : `src/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

**Fichier : `src/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }
}
```

**Fichier : `src/auth/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Fichier : `src/auth/guards/roles.guard.ts`**

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new ForbiddenException(`Rôle requis: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
```

**Fichier : `src/auth/decorators/roles.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Fichier : `src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

#### 1.7 Configuration du serveur principal

**Fichier : `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Sécurité
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGIN'),
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefix API
  app.setGlobalPrefix('api');

  const port = config.get('PORT') || 3002;
  await app.listen(port);

  console.log(`✅ Admin Backend running on http://localhost:${port}`);
  console.log(`✅ API available at http://localhost:${port}/api`);
}

bootstrap();
```

#### 1.8 Créer un utilisateur admin de test

**Fichier : `scripts/create-admin.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mjchauffage.com' },
    update: {},
    create: {
      email: 'admin@mjchauffage.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'MJ Chauffage',
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
      phone: '+213555000000',
    },
  });

  console.log('✅ Admin créé:', admin.email);
  console.log('📧 Email: admin@mjchauffage.com');
  console.log('🔑 Password: Admin@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### 1.9 Tester l'authentification

```bash
# Terminal 1 - Créer l'admin
npx ts-node scripts/create-admin.ts

# Terminal 2 - Démarrer le serveur
npm run start:dev

# Terminal 3 - Tester le login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mjchauffage.com",
    "password": "Admin@123"
  }'
```

**Résultat attendu** :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@mjchauffage.com",
    "firstName": "Admin",
    "lastName": "MJ Chauffage",
    "role": "SUPER_ADMIN"
  }
}
```

✅ **FIN DU JOUR 1** - Auth fonctionnelle

---

### JOUR 2-3 : MODULE PRODUITS

#### 2.1 Créer le module Products

```bash
nest g module products
nest g service products
nest g controller products
```

#### 2.2 DTOs de validation

**Fichier : `src/products/dto/create-product.dto.ts`**

```typescript
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  slug: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  sku: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  compareAtPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;
}
```

**Fichier : `src/products/dto/update-product.dto.ts`**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

#### 2.3 Service Produits

**Fichier : `src/products/products.service.ts`**

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Vérifier slug unique
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Ce slug existe déjà');
    }

    // Vérifier SKU unique
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new ConflictException('Ce SKU existe déjà');
    }

    // Vérifier catégorie si fournie
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Catégorie non trouvée');
      }
    }

    // Créer le produit
    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Vérifier existence
    await this.findOne(id);

    // Vérifier slug unique (si modifié)
    if (updateProductDto.slug) {
      const existingSlug = await this.prisma.product.findUnique({
        where: { slug: updateProductDto.slug },
      });

      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('Ce slug existe déjà');
      }
    }

    // Vérifier SKU unique (si modifié)
    if (updateProductDto.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (existingSku && existingSku.id !== id) {
        throw new ConflictException('Ce SKU existe déjà');
      }
    }

    // Mettre à jour
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    // Vérifier existence
    await this.findOne(id);

    // Supprimer
    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Produit supprimé avec succès' };
  }
}
```

#### 2.4 Controller Produits

**Fichier : `src/products/products.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(+page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

#### 2.5 Tester le module Produits

```bash
# Obtenir le token
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mjchauffage.com","password":"Admin@123"}' \
  | jq -r '.accessToken')

# Créer un produit
curl -X POST http://localhost:3002/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thermostat Digital",
    "slug": "thermostat-digital",
    "sku": "THERM-001",
    "description": "Thermostat programmable",
    "price": 250,
    "stockQuantity": 20
  }'

# Lister les produits
curl http://localhost:3002/api/products \
  -H "Authorization: Bearer $TOKEN"
```

✅ **FIN DU JOUR 2-3** - CRUD Produits complet

---

### JOUR 4 : MODULES COMMANDES & CLIENTS

*[Continue avec la même structure pour Orders et Customers modules]*

---

### JOUR 5 : MODULE ANALYTICS

*[Structure similaire]*

---

### JOUR 6-7 : TESTS UNITAIRES

**Fichier : `src/products/products.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = {
      name: 'Test Product',
      slug: 'test-product',
      sku: 'TEST-001',
      price: 100,
      stockQuantity: 10,
    };

    const mockProduct = { id: '1', ...dto, createdAt: new Date(), updatedAt: new Date() };

    jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.product, 'create').mockResolvedValue(mockProduct as any);

    const result = await service.create(dto);
    
    expect(result.name).toBe(dto.name);
    expect(prisma.product.create).toHaveBeenCalled();
  });
});
```

**Exécuter les tests** :
```bash
npm run test
npm run test:cov # Pour coverage
```

✅ **FIN DE LA PHASE 1** - Backend NestJS complet

---

## 🎯 PHASE 2 : FRONTEND NEXT.JS 14 (7 jours)

*[À créer dans le prochain message si besoin]*

---

## 📋 CHECKLIST PHASE 1

### ✅ Setup
- [ ] Projet NestJS créé
- [ ] Dépendances installées
- [ ] Prisma configuré
- [ ] Variables d'environnement

### ✅ Auth Module
- [ ] Service d'authentification
- [ ] JWT Strategy
- [ ] Guards (JWT + Roles)
- [ ] Controller login
- [ ] Admin créé et testé

### ✅ Products Module
- [ ] DTOs de validation
- [ ] Service CRUD complet
- [ ] Controller avec guards
- [ ] Tests unitaires
- [ ] Tests API (curl)

### ✅ Orders Module
- [ ] Service complet
- [ ] Controller avec guards
- [ ] Tests

### ✅ Analytics Module
- [ ] Service stats
- [ ] Controller
- [ ] Tests

### ✅ Tests
- [ ] Tests unitaires >80%
- [ ] Tests d'intégration
- [ ] Documentation API

---

## 🚀 COMMENCER MAINTENANT

**Terminal 1 - Créer le projet** :
```bash
cd /path/to/project
mkdir admin-v2
cd admin-v2
npx @nestjs/cli new admin-backend
```

**Terminal 2 - Suivre les instructions du Jour 1** ⬆️

**GO ! 🔥**