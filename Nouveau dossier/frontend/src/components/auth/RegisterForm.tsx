'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLocale } from 'next-intl'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    customerType: 'B2C' as 'B2B' | 'B2C',
    agreeToTerms: false,
    subscribeNewsletter: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const currentLocale = useLocale()
  const { register, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Client-side validation
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (formData.customerType === 'B2B' && !formData.companyName.trim()) {
      newErrors.companyName = "Le nom de l'entreprise est requis pour les comptes professionnels"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Vous devez accepter les conditions générales'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      })

      if (result?.success) {
        router.push(`/${currentLocale}/auth/login?registered=1`)
      } else {
        setErrors({ general: result?.message || error || "L'inscription a échoué. Veuillez réessayer." })
      }
    } catch (err) {
      // Error is handled by AuthContext
      setErrors({ general: error || "L'inscription a échoué. Veuillez réessayer." })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-error-50 border border-error-200 rounded-md p-3">
          <p className="text-sm text-error-600">{errors.general}</p>
        </div>
      )}

      {/* Customer Type Selection */}
      <div>
        <label className="form-label">Type de compte</label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              id="b2c"
              name="customerType"
              type="radio"
              value="B2C"
              checked={formData.customerType === 'B2C'}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <label htmlFor="b2c" className="ml-2 block text-sm text-neutral-900">
              <span className="font-medium">Compte Personnel</span>
              <span className="block text-neutral-500">Pour les particuliers et propriétaires</span>
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="b2b"
              name="customerType"
              type="radio"
              value="B2B"
              checked={formData.customerType === 'B2B'}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <label htmlFor="b2b" className="ml-2 block text-sm text-neutral-900">
              <span className="font-medium">Compte Professionnel</span>
              <span className="block text-neutral-500">Pour les entrepreneurs et plombiers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="form-label">
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={`form-input ${errors.firstName ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Votre prénom"
          />
          {errors.firstName && <p className="form-error">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="form-label">
            Nom
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={`form-input ${errors.lastName ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Votre nom"
          />
          {errors.lastName && <p className="form-error">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
          placeholder="votre@email.com"
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="form-label">
          Numéro de téléphone (optionnel)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
          placeholder="Votre numéro de téléphone"
        />
      </div>

      {/* Company Information for B2B */}
      {formData.customerType === 'B2B' && (
        <div>
          <label htmlFor="companyName" className="form-label">
            Nom de l'entreprise
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            value={formData.companyName}
            onChange={handleChange}
            className={`form-input ${errors.companyName ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Nom de votre entreprise"
          />
          {errors.companyName && <p className="form-error">{errors.companyName}</p>}
        </div>
      )}

      <div>
        <label htmlFor="password" className="form-label">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          className={`form-input ${errors.password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
          placeholder="Créez un mot de passe fort"
        />
        {errors.password && <p className="form-error">{errors.password}</p>}
        <p className="mt-1 text-xs text-neutral-500">
          Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="form-label">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`form-input ${errors.confirmPassword ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
          placeholder="Confirmez votre mot de passe"
        />
        {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
      </div>

      {/* Agreements */}
      <div className="space-y-3">
        <div className="flex items-start">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded mt-0.5"
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-neutral-900">
            J'accepte les{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500">
              Conditions Générales
            </Link>{' '}
            et la{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
              Politique de Confidentialité
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && <p className="form-error">{errors.agreeToTerms}</p>}

        <div className="flex items-start">
          <input
            id="subscribeNewsletter"
            name="subscribeNewsletter"
            type="checkbox"
            checked={formData.subscribeNewsletter}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded mt-0.5"
          />
          <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-neutral-900">
            S'abonner à notre newsletter pour des conseils et mises à jour
          </label>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner w-4 h-4 mr-2"></div>
              Création du compte...
            </div>
          ) : (
            'Créer un compte'
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-neutral-600">
          Vous avez déjà un compte?{' '}
          <Link href={`/${currentLocale}/auth/login`} className="font-medium text-primary-600 hover:text-primary-500">
            Connectez-vous ici
          </Link>
        </p>
      </div>
    </form>
  )
}