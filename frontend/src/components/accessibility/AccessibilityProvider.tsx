'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityContextType {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  screenReader: boolean
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [screenReader, setScreenReader] = useState(false)

  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    setReducedMotion(prefersReducedMotion)
    setHighContrast(prefersHighContrast)
    
    // Check for screen reader
    const hasScreenReader = window.navigator.userAgent.includes('NVDA') || 
                           window.navigator.userAgent.includes('JAWS') || 
                           window.speechSynthesis !== undefined
    setScreenReader(hasScreenReader)
    
    // Load saved preferences
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true'
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true'
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large' || 'medium'
    
    setHighContrast(savedHighContrast || prefersHighContrast)
    setReducedMotion(savedReducedMotion || prefersReducedMotion)
    setFontSize(savedFontSize)
  }, [])

  useEffect(() => {
    // Apply accessibility classes to document
    const root = document.documentElement
    
    root.classList.toggle('high-contrast', highContrast)
    root.classList.toggle('reduced-motion', reducedMotion)
    root.classList.toggle('font-small', fontSize === 'small')
    root.classList.toggle('font-large', fontSize === 'large')
    
    // Save preferences
    localStorage.setItem('accessibility-high-contrast', highContrast.toString())
    localStorage.setItem('accessibility-reduced-motion', reducedMotion.toString())
    localStorage.setItem('accessibility-font-size', fontSize)
  }, [highContrast, reducedMotion, fontSize])

  const toggleHighContrast = () => setHighContrast(!highContrast)
  const toggleReducedMotion = () => setReducedMotion(!reducedMotion)

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        reducedMotion,
        fontSize,
        screenReader,
        toggleHighContrast,
        toggleReducedMotion,
        setFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}