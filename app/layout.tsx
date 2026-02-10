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
  const isGitHubPages = process.env.NEXT_PUBLIC_IS_GITHUB_PAGES === 'true'
  
  return (
    <html lang="en" className="dark">
      <head>
        {/* We keep the meta refresh as a fallback, but the JS logic moves below */}
        {isGitHubPages && (
          <meta httpEquiv="refresh" content="5;url=https://forsyth.onrender.com/" />
        )}
      </head>
      <body className={`${inter.className} min-h-screen relative`}>
        {/* MIGRATION OVERLAY: This is the "All-in-one" trigger */}
        {isGitHubPages && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-white">We've Upgraded!</h2>
              <p className="text-zinc-400 mb-6">
                The Forsyth Portal has moved to a faster server. Click below to launch the new portal and support resources.
              </p>
              <button
                onClick={() => {
                  // 1. Open the New Portal in a NEW TAB
                  window.open('https://forsyth.onrender.com/', '_blank', 'noopener,noreferrer');
                  
                  // 2. Open Support/Help in a NEW WINDOW
                  window.open('https://forsyth.onrender.com/help', 'HelpWindow', 'width=500,height=700,noopener,noreferrer');

                  // 3. Redirect THIS current tab to the new home
                  window.location.replace('https://forsyth.onrender.com/');
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all transform hover:scale-105"
              >
                Launch New Portal
              </button>
            </div>
          </div>
        )}
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
