'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import authService from '@/services/authService'
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
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const currentLocale = useLocale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Client-side validation
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.customerType === 'B2B' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for business accounts'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      })

      if (result?.success) {
        router.push(`/${currentLocale}/auth/login?registered=1`)
      } else {
        setErrors({ general: result?.message || 'Registration failed. Please try again.' })
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setErrors({ general: 'Email already exists' })
      } else if (error?.response?.status === 400) {
        setErrors({ general: error.response?.data?.message || 'Invalid data' })
      } else {
        setErrors({ general: 'Server error. Please try again later.' })
      }
    } finally {
      setLoading(false)
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
        <label className="form-label">Account Type</label>
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
              <span className="font-medium">Personal Account</span>
              <span className="block text-neutral-500">For homeowners and individual customers</span>
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
              <span className="font-medium">Business Account</span>
              <span className="block text-neutral-500">For contractors, plumbers, and professionals</span>
            </label>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="form-label">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={`form-input ${errors.firstName ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="form-error">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="form-label">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={`form-input ${errors.lastName ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="form-error">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          Email address
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
          placeholder="Enter your email"
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="form-label">
          Phone number (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter your phone number"
        />
      </div>

      {/* Company Information for B2B */}
      {formData.customerType === 'B2B' && (
        <div>
          <label htmlFor="companyName" className="form-label">
            Company name
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            value={formData.companyName}
            onChange={handleChange}
            className={`form-input ${errors.companyName ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Enter your company name"
          />
          {errors.companyName && <p className="form-error">{errors.companyName}</p>}
        </div>
      )}

      <div>
        <label htmlFor="password" className="form-label">
          Password
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
          placeholder="Create a strong password"
        />
        {errors.password && <p className="form-error">{errors.password}</p>}
        <p className="mt-1 text-xs text-neutral-500">
          Password must contain uppercase, lowercase, number, and special character
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="form-label">
          Confirm password
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
          placeholder="Confirm your password"
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
            I agree to the{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
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
            Subscribe to our newsletter for heating tips and product updates
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
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href={`/${currentLocale}/auth/login`} className="font-medium text-primary-600 hover:text-primary-500">
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  )
}