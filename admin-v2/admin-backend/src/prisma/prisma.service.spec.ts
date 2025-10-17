import { ConfigService } from '@nestjs/config';

describe('PrismaService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("enregistre l'écoute des requêtes en environnement développement", async () => {
    const mockOn = jest.fn();
    const mockConnect = jest.fn().mockResolvedValue(undefined);
    const mockDisconnect = jest.fn().mockResolvedValue(undefined);

    // Mock minimal de @prisma/client
    jest.doMock('@prisma/client', () => ({
      PrismaClient: class {
        $on = mockOn;
        $connect = mockConnect;
        $disconnect = mockDisconnect;
      },
      Prisma: { QueryEvent: class {} },
    }));

    let PrismaServiceLocal: any;
    jest.isolateModules(() => {
      const mod = require('./prisma.service');
      PrismaServiceLocal = mod.PrismaService;
    });

    const config = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'DATABASE_URL') return 'postgresql://localhost:5432/db';
        return undefined;
      }),
    } as unknown as ConfigService;

    const service = new PrismaServiceLocal(config);

    // Le constructeur doit enregistrer l'événement 'query' en dev
    expect(mockOn).toHaveBeenCalledWith(
      'query',
      expect.any(Function),
    );

    // Couvrir onModuleInit et onModuleDestroy
    await service.onModuleInit();
    expect(mockConnect).toHaveBeenCalled();

    await service.onModuleDestroy();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('enregistre beforeExit via enableShutdownHooks et ferme l’app', async () => {
    const mockOn = jest.fn();
    const mockConnect = jest.fn().mockResolvedValue(undefined);
    const mockDisconnect = jest.fn().mockResolvedValue(undefined);

    jest.doMock('@prisma/client', () => ({
      PrismaClient: class {
        $on = mockOn;
        $connect = mockConnect;
        $disconnect = mockDisconnect;
      },
      Prisma: { QueryEvent: class {} },
    }));

    let PrismaServiceLocal2: any;
    jest.isolateModules(() => {
      const mod = require('./prisma.service');
      PrismaServiceLocal2 = mod.PrismaService;
    });

    const config = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'DATABASE_URL') return 'postgresql://localhost:5432/db';
        return undefined;
      }),
    } as unknown as ConfigService;

    const service = new PrismaServiceLocal2(config);

    const app = { close: jest.fn().mockResolvedValue(undefined) };
    await service.enableShutdownHooks(app as any);

    // Récupérer le callback beforeExit et l'exécuter
    const entry = mockOn.mock.calls.find(([event]) => event === 'beforeExit');
    expect(entry).toBeDefined();
    const [, callback] = entry!;
    await callback();
    expect(app.close).toHaveBeenCalled();
  });
});