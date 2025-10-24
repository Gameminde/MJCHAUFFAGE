import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwt.strategy'
import { AuthService } from '../auth.service'

describe('JwtStrategy', () => {
  let config: jest.Mocked<ConfigService>
  let auth: jest.Mocked<AuthService>

  beforeEach(() => {
    config = ({
      getOrThrow: jest.fn().mockReturnValue('secret'),
    } as unknown) as jest.Mocked<ConfigService>

    auth = ({
      validateUser: jest.fn(),
    } as unknown) as jest.Mocked<AuthService>
  })

  it('validate() retourne l’utilisateur actif', async () => {
    const strategy = new JwtStrategy(config, auth)
    auth.validateUser.mockResolvedValue({
      id: '1',
      email: 'e',
      firstName: 'f',
      lastName: 'l',
      role: 'ADMIN',
      isActive: true,
    } as any)

    const user = await strategy.validate({
      sub: '1',
      email: 'e',
      role: 'ADMIN',
      firstName: 'f',
      lastName: 'l',
    })

    expect(user?.id).toBe('1')
    expect(auth.validateUser).toHaveBeenCalled()
  })

  it('validate() lève si utilisateur invalide', async () => {
    const strategy = new JwtStrategy(config, auth)
    auth.validateUser.mockResolvedValue(null)

    await expect(
      strategy.validate({
        sub: '1',
        email: 'e',
        role: 'ADMIN',
        firstName: 'f',
        lastName: 'l',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})