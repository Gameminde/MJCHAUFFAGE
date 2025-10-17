/**
 * Tests de bootstrap dans main.ts pour augmenter la couverture:
 * - Vérifie la configuration CORS, le prefix API, les middlewares helmet/compression
 * - Vérifie l'appel à listen avec le port par défaut et un port personnalisé
 */

import type { INestApplication } from '@nestjs/common';

// Mocks globaux pour les middlewares
jest.mock('helmet', () => jest.fn(() => 'helmet-middleware'));
jest.mock('compression', () => jest.fn(() => 'compression-middleware'));

describe('main bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('configure et démarre avec les valeurs par défaut', async () => {
    const mockConfig = { get: jest.fn((key: string, def?: any) => def) };
    const mockApp: Partial<INestApplication> & {
      get: jest.Mock;
      use: jest.Mock;
      enableCors: jest.Mock;
      useGlobalPipes: jest.Mock;
      setGlobalPrefix: jest.Mock;
      listen: jest.Mock;
    } = {
      get: jest.fn().mockReturnValue(mockConfig),
      use: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    // Mock de NestFactory.create pour retourner notre app factice
    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: jest.fn(() => Promise.resolve(mockApp)),
      },
    }));

    // Importer le module déclenche bootstrap()
    jest.isolateModules(() => {
      require('./main');
    });

    // Laisser l'event loop terminer les promesses du bootstrap
    await new Promise((r) => setImmediate(r));

    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api/v1');
    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'http://localhost:3000',
        credentials: true,
      }),
    );
    expect(mockApp.use).toHaveBeenCalledWith('helmet-middleware');
    expect(mockApp.use).toHaveBeenCalledWith('compression-middleware');
    expect(mockApp.listen).toHaveBeenCalledWith(3002);
  });

  it('utilise l’origin et le port fournis par ConfigService', async () => {
    const mockConfig = {
      get: jest.fn((key: string, def?: any) => {
        if (key === 'CORS_ORIGIN') return 'http://admin.example.test';
        if (key === 'PORT') return 4200;
        return def;
      }),
    };
    const mockApp: Partial<INestApplication> & {
      get: jest.Mock;
      use: jest.Mock;
      enableCors: jest.Mock;
      useGlobalPipes: jest.Mock;
      setGlobalPrefix: jest.Mock;
      listen: jest.Mock;
    } = {
      get: jest.fn().mockReturnValue(mockConfig),
      use: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: jest.fn(() => Promise.resolve(mockApp)),
      },
    }));

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise((r) => setImmediate(r));

    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({ origin: 'http://admin.example.test' }),
    );
    expect(mockApp.listen).toHaveBeenCalledWith(4200);
  });
});