'use client'

import { useState } from 'react'
import { useAccessibility } from './AccessibilityProvider'
import { 
  EyeIcon, 
  SpeakerWaveIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    highContrast,
    reducedMotion,
    fontSize,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
  } = useAccessibility()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Open accessibility options"
      >
        <AdjustmentsHorizontalIcon className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Accessibility Options</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Close accessibility options"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <EyeIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">High Contrast</span>
          </div>
          <button
            onClick={toggleHighContrast}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              highContrast ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={highContrast}
            aria-label="Toggle high contrast mode"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SpeakerWaveIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Reduce Motion</span>
          </div>
          <button
            onClick={toggleReducedMotion}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Toggle reduced motion"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reducedMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <div className="flex space-x-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-1 text-xs rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fontSize === size
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={fontSize === size}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Skip Links */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Quick Navigation:</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="#main-content"
              className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Skip to main content
            </a>
            <a
              href="#navigation"
              className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Skip to navigation
            </a>
            <a
              href="#footer"
              className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Skip to footer
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}