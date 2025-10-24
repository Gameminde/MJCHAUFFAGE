import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { AuthService, AuthResponse } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginDto } from './dto/login.dto'

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))
import * as bcrypt from 'bcryptjs'

describe('AuthService', () => {
  let service: AuthService
  let prisma: jest.Mocked<PrismaService>
  let jwt: jest.Mocked<JwtService>
  let config: jest.Mocked<ConfigService>

  const adminUser = {
    id: 'u1',
    email: 'admin@example.com',
    password: 'hashed',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true,
    emailVerified: true,
  } as any

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as any

    jwt = {
      sign: jest.fn(),
    } as any

    config = {
      get: jest.fn((key: string, def?: any) => def),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'secret'
        if (key === 'JWT_REFRESH_SECRET') return 'refreshsecret'
        return 'value'
      }),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    ;(bcrypt.compare as jest.Mock).mockReset()
    jwt.sign.mockReset()
  })
  it('login: succès pour un admin actif avec mot de passe correct', async () => {
    prisma.user.findUnique.mockResolvedValue(adminUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    jwt.sign.mockReturnValueOnce('access-token')
    jwt.sign.mockReturnValueOnce('refresh-token')

    const dto: LoginDto = { email: adminUser.email, password: 'plain' }
    const result = (await service.login(dto)) as AuthResponse

    expect(result.user.email).toBe(adminUser.email)
    expect(result.tokens.accessToken).toBe('access-token')
    expect(result.tokens.refreshToken).toBe('refresh-token')
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: adminUser.id },
      data: { lastLoginAt: expect.any(Date) },
    })
    expect(jwt.sign).toHaveBeenCalledTimes(2)
  })

  it('login: échec si utilisateur inexistant', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    const dto: LoginDto = { email: 'no@user.tld', password: 'plain' }
    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('login: échec si compte inactif', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...adminUser, isActive: false })
    const dto: LoginDto = { email: adminUser.email, password: 'plain' }
    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('login: échec si mot de passe incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue(adminUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    const dto: LoginDto = { email: adminUser.email, password: 'wrong' }
    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('login: échec si rôle non-admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...adminUser, role: 'USER' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    const dto: LoginDto = { email: adminUser.email, password: 'plain' }
    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('login: échec si utilisateur sans mot de passe', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...adminUser, password: null })
    const dto: LoginDto = { email: adminUser.email, password: 'plain' }
    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('validateUser: retourne l’utilisateur actif', async () => {
    prisma.user.findUnique.mockResolvedValue(adminUser)
    const result = await service.validateUser({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
    })
    expect(result?.email).toBe(adminUser.email)
  })

  it('validateUser: null si inactif', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...adminUser, isActive: false })
    const result = await service.validateUser({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
    })
    expect(result).toBeNull()
  })
})
