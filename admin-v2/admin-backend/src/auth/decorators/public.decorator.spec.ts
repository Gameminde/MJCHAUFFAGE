import 'reflect-metadata'
import { IS_PUBLIC_KEY, Public } from './public.decorator'

describe('Public decorator', () => {
  it('définit la metadata isPublic à true sur une classe', () => {
    class Dummy {}
    Public()(Dummy)
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, Dummy)).toBe(true)
  })
})