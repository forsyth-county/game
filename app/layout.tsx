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
import { AboutBlankCloak } from '@/components/AboutBlankCloak'
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
              // Check if we're on the GitHub Pages site
              if (window.location.hostname === 'forsyth-county.github.io' && 
                  window.location.pathname === '/') {
                // Create a temporary link to click instead of popup
                const tempLink = document.createElement('a');
                tempLink.href = 'https://forsyth.onrender.com';
                tempLink.target = '_blank';
                tempLink.textContent = '🎮 Click here to visit new portal';
                tempLink.style.css = \`
                  display: inline-block;
                  padding: 12px 24px;
                  background: linear-gradient(45deg, #00eeff, #8b5cf6);
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  font-size: 16px;
                  margin: 20px auto;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 12px rgba(0, 238, 255, 0.3);
                \`;
                tempLink.onclick = () => {
                  // Open in new tab
                  const newWindow = window.open('https://forsyth.onrender.com', '_blank');
                  if (newWindow) {
                    newWindow.focus();
                  }
                };
                
                // Replace page content with redirect message
                document.body.innerHTML = \`
                  <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #1e1b4b 0%, #0a0a0a 50%, #050505 100%);
                    color: white;
                  ">
                    <div style="
                      max-width: 500px;
                      padding: 2rem;
                      background: rgba(0, 0, 0, 0.9);
                      border-radius: 1rem;
                      border: 3px solid #00eeff;
                      box-shadow: 0 0 2rem rgba(0, 238, 255, 0.4);
                      position: relative;
                      animation: fadeIn 0.8s ease-out;
                    ">
                      <h1 style="margin: 0 0 1rem 0; color: #00eeff;">🚀 Portal Redirect</h1>
                      <p style="margin: 0 0 1rem 0; font-size: 1.1rem;">
                        Click the button below to visit the new Forsyth Portal
                      </p>
                      <div style="margin: 2rem 0 0 0;">
                        \${tempLink.outerHTML}
                      </div>
                      <p style="margin: 2rem 0 0 0; font-size: 0.9rem; color: #666;">
                        This GitHub Pages site is permanently moved.
                      </p>
                    </div>
                  </div>
                \`;
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
        <AboutBlankCloak />
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
