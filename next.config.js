/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const basePath = isGitHubPages ? '' : ''

const nextConfig = {
  // Disable ESLint during build to allow pre-existing warnings/errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable static export for GitHub Pages
  output: 'export',
  
  // GitHub Pages serves from /<repo-name> path
  // Set to empty string if using custom domain or root deployment
  basePath: basePath,
  assetPrefix: basePath,
  
  // Make basePath available to client-side code
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_IS_GITHUB_PAGES: isGitHubPages.toString(),
  },
  
  images: {
    // Required for static export
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Trailing slash disabled to have clean URLs
  trailingSlash: false,
  
  // Skip static optimization for better GitHub Pages compatibility
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
