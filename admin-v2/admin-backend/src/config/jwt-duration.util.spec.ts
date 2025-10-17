import { JwtDurationUtil } from './jwt-duration.util'

describe('JwtDurationUtil', () => {
  it('laisse inchangé un nombre (secondes)', () => {
    expect(JwtDurationUtil.toSeconds(120)).toBe(120)
  })

  it('convertit les minutes en secondes', () => {
    expect(JwtDurationUtil.toSeconds('15m')).toBe(900)
  })

  it('convertit les heures en secondes', () => {
    expect(JwtDurationUtil.toSeconds('1h')).toBe(3600)
  })

  it('convertit les jours en secondes', () => {
    expect(JwtDurationUtil.toSeconds('7d')).toBe(604800)
  })

  it('convertit les secondes', () => {
    expect(JwtDurationUtil.toSeconds('30s')).toBe(30)
  })

  it('lève une erreur sur un format invalide', () => {
    expect(() => JwtDurationUtil.toSeconds('abc')).toThrow()
  })
})