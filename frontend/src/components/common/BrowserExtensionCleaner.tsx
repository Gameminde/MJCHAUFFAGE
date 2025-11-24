'use client'

import { useEffect } from 'react'

export function BrowserExtensionCleaner() {
    useEffect(() => {
        // Remove browser extension attributes that cause hydration warnings
        const htmlElement = document.documentElement

        // List of known extension attributes
        const extensionAttributes = [
            'data-jetski-tab-id',
            'data-grammarly-shadow-root',
            'data-lt-installed',
            'cz-shortcut-listen'
        ]

        extensionAttributes.forEach(attr => {
            if (htmlElement.hasAttribute(attr)) {
                htmlElement.removeAttribute(attr)
            }
        })
    }, [])

    return null
}
