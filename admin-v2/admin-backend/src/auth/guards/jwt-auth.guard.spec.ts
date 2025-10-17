import { Reflector } from '@nestjs/core'
import { JwtAuthGuard } from './jwt-auth.guard'

describe('JwtAuthGuard', () => {
  let reflector: jest.Mocked<Reflector>

  const context = ({
    getHandler: () => function handler() {},
    getClass: () => class TestClass {},
    switchToHttp: () => ({ getRequest: () => ({}) }),
  } as unknown) as any

  beforeEach(() => {
    reflector = ({
      getAllAndOverride: jest.fn(),
    } as unknown) as jest.Mocked<Reflector>
  })

  it('retourne true pour une route publique', () => {
    reflector.getAllAndOverride.mockReturnValue(true as any)
    const guard = new JwtAuthGuard(reflector)
    expect(guard.canActivate(context)).toBe(true)
  })

  it('délègue au parent quand non public', () => {
    reflector.getAllAndOverride.mockReturnValue(false as any)
    const baseProto = Object.getPrototypeOf(JwtAuthGuard.prototype)
    const spy = jest.spyOn(baseProto, 'canActivate').mockReturnValue(true as any)

    const guard = new JwtAuthGuard(reflector)
    expect(guard.canActivate(context)).toBe(true)

    spy.mockRestore()
  })
})