import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/utils/seo'

interface Props {
  params: { locale: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'SEO & Accessibility Test Page',
    description: 'This page tests SEO implementation and accessibility features for the MJ CHAUFFAGE website.',
    keywords: ['seo', 'accessibility', 'testing', 'web standards'],
    path: '/seo-test',
    locale: params.locale,
  })
}

export default function SEOTestLayout({ children }: Props) {
  return <>{children}</>
}