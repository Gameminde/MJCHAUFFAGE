'use client'

import Link from 'next/link'
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/utils/seo'
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/StructuredData'
import { AccessibilityChecker } from '@/utils/accessibility'

interface Props {
  params: { locale: string }
}

export default function SEOTestPage({ params }: Props) {
  const breadcrumbItems = [
    { name: 'Home', url: `/${params.locale}` },
    { name: 'SEO Test', url: `/${params.locale}/seo-test` },
  ]

  const sampleProduct = {
    name: 'Premium Gas Boiler Model X1',
    description: 'High-efficiency gas boiler with advanced temperature control and energy-saving features.',
    price: '150000',
    images: ['/products/boiler-x1.jpg'],
    inStock: true,
    rating: { value: 4.8, count: 127 }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Structured Data */}
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <ProductStructuredData {...sampleProduct} />
      
      {/* SEO Test Content */}
      <article>
        <header>
          <h1>SEO & Accessibility Test Page</h1>
          <p className="text-lg text-gray-600 mt-2">
            This page demonstrates proper SEO implementation and accessibility features.
          </p>
        </header>

        <nav aria-label="Page contents">
          <h2>Table of Contents</h2>
          <ol>
            <li><a href="#heading-structure">Heading Structure</a></li>
            <li><a href="#images">Images and Alt Text</a></li>
            <li><a href="#forms">Forms and Labels</a></li>
            <li><a href="#links">Links and Navigation</a></li>
            <li><a href="#aria">ARIA Implementation</a></li>
          </ol>
        </nav>

        <section id="heading-structure" aria-labelledby="heading-structure-title">
          <h2 id="heading-structure-title">Heading Structure</h2>
          <p>This section demonstrates proper heading hierarchy:</p>
          
          <h3>Level 3 Heading</h3>
          <p>Content under level 3 heading.</p>
          
          <h4>Level 4 Heading</h4>
          <p>Content under level 4 heading.</p>
          
          <h3>Another Level 3 Heading</h3>
          <p>More content to show proper structure.</p>
        </section>

        <section id="images" aria-labelledby="images-title">
          <h2 id="images-title">Images and Alt Text</h2>
          <p>Examples of properly implemented images:</p>
          
          <figure>
            <img 
              src="/products/boiler-example.jpg" 
              alt="Modern gas boiler installation in a residential basement showing proper ventilation and safety features"
              width={400}
              height={300}
            />
            <figcaption>
              Example of a professional boiler installation with proper alt text
            </figcaption>
          </figure>
          
          <img 
            src="/decorative-pattern.svg" 
            alt=""
            role="presentation"
            aria-hidden="true"
          />
          <p>Decorative image above uses empty alt text and aria-hidden.</p>
        </section>

        <section id="forms" aria-labelledby="forms-title">
          <h2 id="forms-title">Forms and Labels</h2>
          <p>Example of accessible form implementation:</p>
          
          <form>
            <fieldset>
              <legend>Contact Information</legend>
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  aria-required="true"
                  aria-describedby="name-help"
                />
                <div id="name-help" className="help-text">
                  Enter your first and last name
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  aria-required="true"
                  aria-describedby="email-error"
                />
                <div id="email-error" className="error-message" role="alert" aria-live="polite">
                  {/* Error message would appear here */}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="service">Service Type</label>
                <select id="service" name="service" aria-describedby="service-help">
                  <option value="">Select a service</option>
                  <option value="installation">Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                </select>
                <div id="service-help" className="help-text">
                  Choose the type of service you need
                </div>
              </div>
              
              <fieldset>
                <legend>Preferred Contact Method</legend>
                <div className="radio-group">
                  <input type="radio" id="contact-phone" name="contact" value="phone" />
                  <label htmlFor="contact-phone">Phone</label>
                </div>
                <div className="radio-group">
                  <input type="radio" id="contact-email" name="contact" value="email" />
                  <label htmlFor="contact-email">Email</label>
                </div>
              </fieldset>
              
              <button type="submit" aria-describedby="submit-help">
                Submit Request
              </button>
              <div id="submit-help" className="help-text">
                We'll respond within 24 hours
              </div>
            </fieldset>
          </form>
        </section>

        <section id="links" aria-labelledby="links-title">
          <h2 id="links-title">Links and Navigation</h2>
          <p>Examples of accessible links:</p>
          
          <ul>
            <li>
              <Link href={`/${params.locale}/products`}>Browse our heating products</Link>
            </li>
            <li>
              <Link href={`/${params.locale}/services`}>Learn about our services</Link>
            </li>
            <li>
              <a 
                href="https://example.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Visit external website (opens in new window)"
              >
                External link
              </a>
            </li>
            <li>
              <Link href={`/${params.locale}/contact`} aria-describedby="contact-desc">
                Contact us
              </Link>
              <span id="contact-desc" className="sr-only">
                Get in touch with our expert team
              </span>
            </li>
          </ul>
        </section>

        <section id="aria" aria-labelledby="aria-title">
          <h2 id="aria-title">ARIA Implementation</h2>
          <p>Examples of ARIA attributes in use:</p>
          
          <div className="card" role="region" aria-labelledby="product-card-title">
            <h3 id="product-card-title">Featured Product</h3>
            <p>High-efficiency boiler with smart controls</p>
            <button 
              aria-expanded="false" 
              aria-controls="product-details"
              onClick={() => {
                const details = document.getElementById('product-details')
                const button = document.querySelector('[aria-controls="product-details"]')
                if (details && button) {
                  const isExpanded = button.getAttribute('aria-expanded') === 'true'
                  button.setAttribute('aria-expanded', (!isExpanded).toString())
                  details.style.display = isExpanded ? 'none' : 'block'
                }
              }}
            >
              Show Details
            </button>
            <div id="product-details" style={{ display: 'none' }}>
              <p>Detailed product information would appear here.</p>
            </div>
          </div>
          
          <div role="status" aria-live="polite" aria-atomic="true">
            <p>Status updates will be announced to screen readers</p>
          </div>
          
          <nav aria-label="Pagination">
            <ul className="pagination">
              <li>
                <a href="?page=1" aria-label="Go to page 1">1</a>
              </li>
              <li>
                <a href="?page=2" aria-label="Go to page 2" aria-current="page">2</a>
              </li>
              <li>
                <a href="?page=3" aria-label="Go to page 3">3</a>
              </li>
            </ul>
          </nav>
        </section>

        <section aria-labelledby="testing-tools-title">
          <h2 id="testing-tools-title">Accessibility Testing</h2>
          <p>This page can be tested with:</p>
          <ul>
            <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
            <li>Keyboard navigation (Tab, Shift+Tab, Enter, Space)</li>
            <li>Browser accessibility tools</li>
            <li>Automated testing tools (axe, Lighthouse)</li>
          </ul>
          
          <div className="testing-checklist">
            <h3>Manual Testing Checklist</h3>
            <ul role="list">
              <li role="listitem">
                <input type="checkbox" id="keyboard-nav" />
                <label htmlFor="keyboard-nav">All interactive elements accessible via keyboard</label>
              </li>
              <li role="listitem">
                <input type="checkbox" id="focus-visible" />
                <label htmlFor="focus-visible">Focus indicators visible and clear</label>
              </li>
              <li role="listitem">
                <input type="checkbox" id="screen-reader" />
                <label htmlFor="screen-reader">Content makes sense with screen reader</label>
              </li>
              <li role="listitem">
                <input type="checkbox" id="color-contrast" />
                <label htmlFor="color-contrast">Sufficient color contrast ratios</label>
              </li>
            </ul>
          </div>
        </section>
      </article>
    </div>
  )
}