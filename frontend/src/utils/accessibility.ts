// Accessibility testing and validation utilities

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  rule: string
  message: string
  element?: HTMLElement
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
}

export class AccessibilityChecker {
  private issues: AccessibilityIssue[] = []

  // Check for common accessibility issues
  checkPage(): AccessibilityIssue[] {
    this.issues = []
    
    this.checkImages()
    this.checkHeadings()
    this.checkForms()
    this.checkLinks()
    this.checkColors()
    this.checkKeyboardNavigation()
    this.checkARIA()
    
    return this.issues
  }

  private addIssue(issue: AccessibilityIssue) {
    this.issues.push(issue)
  }

  private checkImages() {
    const images = document.querySelectorAll('img')
    images.forEach((img) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        this.addIssue({
          type: 'error',
          rule: 'img-alt',
          message: 'Image missing alt text',
          element: img,
          severity: 'serious'
        })
      }
      
      if (img.alt === img.src || img.alt === 'image') {
        this.addIssue({
          type: 'warning',
          rule: 'img-alt-meaningful',
          message: 'Image alt text should be meaningful',
          element: img,
          severity: 'moderate'
        })
      }
    })
  }

  private checkHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1))
      
      if (level - previousLevel > 1) {
        this.addIssue({
          type: 'warning',
          rule: 'heading-order',
          message: 'Heading levels should not skip',
          element: heading as HTMLElement,
          severity: 'moderate'
        })
      }
      
      if (!heading.textContent?.trim()) {
        this.addIssue({
          type: 'error',
          rule: 'heading-empty',
          message: 'Heading should not be empty',
          element: heading as HTMLElement,
          severity: 'serious'
        })
      }
      
      previousLevel = level
    })
    
    const h1Count = document.querySelectorAll('h1').length
    if (h1Count === 0) {
      this.addIssue({
        type: 'error',
        rule: 'page-has-heading-one',
        message: 'Page should have exactly one h1 element',
        severity: 'serious'
      })
    } else if (h1Count > 1) {
      this.addIssue({
        type: 'warning',
        rule: 'page-has-heading-one',
        message: 'Page should have only one h1 element',
        severity: 'moderate'
      })
    }
  }

  private checkForms() {
    const inputs = document.querySelectorAll('input, select, textarea')
    
    inputs.forEach((input) => {
      const hasLabel = this.hasLabel(input)
      const hasAriaLabel = input.getAttribute('aria-label')
      const hasAriaLabelledby = input.getAttribute('aria-labelledby')
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
        this.addIssue({
          type: 'error',
          rule: 'label',
          message: 'Form element missing label',
          element: input as HTMLElement,
          severity: 'critical'
        })
      }
      
      if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
        this.addIssue({
          type: 'warning',
          rule: 'aria-required-attr',
          message: 'Required field should have aria-required attribute',
          element: input as HTMLElement,
          severity: 'moderate'
        })
      }
    })
  }

  private hasLabel(element: Element): boolean {
    const id = element.id
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`)
      if (label) return true
    }
    
    const parentLabel = element.closest('label')
    return !!parentLabel
  }

  private checkLinks() {
    const links = document.querySelectorAll('a')
    
    links.forEach((link) => {
      if (!link.textContent?.trim() && !link.getAttribute('aria-label')) {
        this.addIssue({
          type: 'error',
          rule: 'link-name',
          message: 'Link missing accessible name',
          element: link as HTMLElement,
          severity: 'serious'
        })
      }
      
      if (link.href && link.textContent?.trim().toLowerCase() === 'click here') {
        this.addIssue({
          type: 'warning',
          rule: 'link-name-meaningful',
          message: 'Link text should be meaningful',
          element: link as HTMLElement,
          severity: 'moderate'
        })
      }
      
      if (link.target === '_blank' && !link.getAttribute('aria-label')?.includes('opens in new')) {
        this.addIssue({
          type: 'warning',
          rule: 'link-in-text-block',
          message: 'Links opening in new window should indicate this to users',
          element: link as HTMLElement,
          severity: 'moderate'
        })
      }
    })
  }

  private checkColors() {
    // This would require more complex color contrast calculation
    // For now, we'll check for common issues
    const elements = document.querySelectorAll('*')
    
    elements.forEach((element) => {
      const style = window.getComputedStyle(element)
      const backgroundColor = style.backgroundColor
      const color = style.color
      
      // Check for transparent text on transparent background
      if (backgroundColor === 'rgba(0, 0, 0, 0)' && color === 'rgba(0, 0, 0, 0)') {
        this.addIssue({
          type: 'warning',
          rule: 'color-contrast',
          message: 'Element may have insufficient color contrast',
          element: element as HTMLElement,
          severity: 'moderate'
        })
      }
    })
  }

  private checkKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    focusableElements.forEach((element) => {
      if (element.getAttribute('tabindex') === '-1' && !element.getAttribute('aria-hidden')) {
        this.addIssue({
          type: 'warning',
          rule: 'tabindex',
          message: 'Interactive element should be keyboard accessible',
          element: element as HTMLElement,
          severity: 'serious'
        })
      }
    })
  }

  private checkARIA() {
    const elementsWithAriaLabel = document.querySelectorAll('[aria-label]')
    
    elementsWithAriaLabel.forEach((element) => {
      if (!element.getAttribute('aria-label')?.trim()) {
        this.addIssue({
          type: 'error',
          rule: 'aria-label',
          message: 'aria-label should not be empty',
          element: element as HTMLElement,
          severity: 'serious'
        })
      }
    })
    
    const elementsWithAriaLabelledby = document.querySelectorAll('[aria-labelledby]')
    
    elementsWithAriaLabelledby.forEach((element) => {
      const labelledbyId = element.getAttribute('aria-labelledby')
      if (labelledbyId && !document.getElementById(labelledbyId)) {
        this.addIssue({
          type: 'error',
          rule: 'aria-labelledby',
          message: 'aria-labelledby references non-existent element',
          element: element as HTMLElement,
          severity: 'serious'
        })
      }
    })
  }
}

// Utility functions for accessibility
export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  })
  
  firstElement?.focus()
}

export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel
  
  // Check aria-labelledby
  const ariaLabelledby = element.getAttribute('aria-labelledby')
  if (ariaLabelledby) {
    const labelElement = document.getElementById(ariaLabelledby)
    if (labelElement) return labelElement.textContent || ''
  }
  
  // Check associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) return label.textContent || ''
  }
  
  // Check parent label
  const parentLabel = element.closest('label')
  if (parentLabel) return parentLabel.textContent || ''
  
  // Fallback to element text content
  return element.textContent || ''
}

// Hook for accessibility testing in development
export function useAccessibilityTesting() {
  if (process.env.NODE_ENV === 'development') {
    const checker = new AccessibilityChecker()
    
    const runCheck = () => {
      const issues = checker.checkPage()
      if (issues.length > 0) {
        console.group('🔍 Accessibility Issues Found')
        issues.forEach((issue) => {
          const logMethod = issue.type === 'error' ? 'error' : 'warn'
          console[logMethod](`${issue.rule}: ${issue.message}`, issue.element)
        })
        console.groupEnd()
      }
    }
    
    // Run check after DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(runCheck, 100)
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })
    
    // Initial check
    setTimeout(runCheck, 1000)
    
    return { runCheck, issues: checker.checkPage() }
  }
  
  return { runCheck: () => {}, issues: [] }
}