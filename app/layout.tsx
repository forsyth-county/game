import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { TabCloakLoader } from '@/components/TabCloakLoader'
import { Protection } from '@/components/Protection'
import { ScreenPrivacyGuard } from '@/components/ScreenPrivacyGuard'
import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { TosNotification } from '@/components/TosNotification'
import { TabHider } from '@/components/TabHider'
import { TimeBasedAccessControl } from '@/components/TimeBasedAccessControl'
import { GeoLock } from '@/components/GeoLock'
import { UserProvider } from '@/lib/userContext'
import { MouseGradient } from '@/components/MouseGradient'
import { VisitorTracker } from '@/components/VisitorTracker'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Forsyth Educational Portal - Your Gateway to Learning & Fun',
  description: 'Discover a world of educational games, interactive learning tools, and study resources. Your fast, curated portal for safe and engaging online learning - built for students, designed for success.',
  keywords: 'educational games, learning platform, student portal, interactive learning, study tools, educational resources, safe gaming, learning fun',
  icons: {
    icon: 'https://site.imsglobal.org/sites/default/files/orgs/logos/primary/fcslogo_hexagon.png',
  },
  verification: {
    google: 'dBeR2SaEdkXg7Pf2jyWBcxc32UHXzfB-MdjpPje0h3g',
  },
  openGraph: {
    title: 'Forsyth Educational Portal - Learn & Play',
    description: 'Your gateway to educational games and interactive learning tools. Fast, safe, and designed for student success.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forsyth Educational Portal',
    description: 'Educational gaming and learning platform for students',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen`}>
        <UserProvider>
          <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FGXXN9EK0N"
          strategy="afterInteractive"
        />
        <GoogleAnalytics />
        
        <Script
          src="https://web3forms.com/client/script.js"
          strategy="afterInteractive"
          async
          defer
        />
        
        <GoogleAnalytics />
        
        {/* Auto-redirect to Render site */}
        <Script
          id="render-redirect"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname === 'forsyth-county.github.io') {
                // Open new tab to Render site
                window.open('https://forsyth.onrender.com', '_blank');
                
                // Optional: Close current tab after delay
                setTimeout(() => {
                  window.close();
                }, 1000);
              }
            }
            `
          }}
        />
        
        <div className="fixed inset-0 bg-gradient-cosmic -z-10" />
        <MouseGradient />
        <VisitorTracker />
        <GeoLock />
        <TimeBasedAccessControl />
        <Protection />
        <ScreenPrivacyGuard />
        <TabCloakLoader />
        <TabHider />
        <AnnouncementBanner />
        <TosNotification />
        <Navigation />
        <main className="pt-24 pb-12 px-4">
          {children}
        </main>
        {/* Analytics and SpeedInsights removed */}
        </UserProvider>
      </body>
    </html>
  )
}
