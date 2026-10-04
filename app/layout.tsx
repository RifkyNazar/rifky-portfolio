import type { Metadata } from 'next';
import { profile } from '@/data/portfolio';
import { personStructuredData, siteDescription, siteTitle, siteUrl } from '@/lib/site-metadata';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: siteTitle, template: `%s | ${profile.name}` },
  description: siteDescription,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, ...(siteUrl ? { url: siteUrl.href } : {}) }],
  creator: profile.name,
  keywords: [profile.name, profile.role, 'Web Developer', 'React', 'Next.js', 'Node.js', 'Information Technology', 'Sri Lanka', 'AI', 'Computer Vision'],
  ...(siteUrl ? { alternates: { canonical: '/' } } : {}),
  openGraph: { title: siteTitle, description: siteDescription, type: 'website', locale: 'en_US', siteName: `${profile.name} Portfolio`, ...(siteUrl ? { url: siteUrl.href } : {}) },
  twitter: { card: 'summary_large_image', title: siteTitle, description: siteDescription, images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${profile.name} — ${profile.role}` }] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="dark" suppressHydrationWarning><body>
    <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('rifky-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch{document.documentElement.dataset.theme='dark'}try{if(sessionStorage.getItem('rifky-intro')==='seen')document.documentElement.dataset.intro='seen'}catch{}` }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData).replace(/</g, '\\u003c') }} />
    {children}
  </body></html>;
}
