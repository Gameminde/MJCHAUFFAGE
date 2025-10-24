import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'

const createContext = (user?: any) => ({
  getHandler: () => function handler() {},
  getClass: () => class TestClass {},
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
}) as any

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>

  beforeEach(() => {
    reflector = ({
      getAllAndOverride: jest.fn(),
    } as unknown) as jest.Mocked<Reflector>
  })

  it('autorise si aucune metadata de rôles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined as any)
    const guard = new RolesGuard(reflector)
    expect(guard.canActivate(createContext({ role: 'ADMIN' }))).toBe(true)
  })

  it('refuse si utilisateur absent et rôles requis', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN'])
    const guard = new RolesGuard(reflector)
    expect(guard.canActivate(createContext(undefined))).toBe(false)
  })

  it('autorise si rôle correspond', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN'])
    const guard = new RolesGuard(reflector)
    expect(guard.canActivate(createContext({ role: 'ADMIN' }))).toBe(true)
  })

  it('refuse si rôle ne correspond pas', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN'])
    const guard = new RolesGuard(reflector)
    expect(guard.canActivate(createContext({ role: 'USER' }))).toBe(false)
  })
})