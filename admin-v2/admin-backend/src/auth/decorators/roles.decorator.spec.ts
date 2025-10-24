import 'reflect-metadata'
import { ROLES_KEY, Roles } from './roles.decorator'

describe('Roles decorator', () => {
  it('définit la metadata roles avec les rôles passés', () => {
    class Dummy {}
    Roles('ADMIN', 'SUPER_ADMIN')(Dummy)
    expect(Reflect.getMetadata(ROLES_KEY, Dummy)).toEqual(['ADMIN', 'SUPER_ADMIN'])
  })
})