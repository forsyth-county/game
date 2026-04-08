/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const basePath = isGitHubPages ? '/portal' : ''

const nextConfig = {
  // Disable ESLint during build to allow pre-existing warnings/errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Transpile lucide-react for better compatibility with static export
  transpilePackages: ['lucide-react'],
  
  // Enable static export for GitHub Pages
  output: 'export',
  
  // GitHub Pages serves from /<repo-name>/ path
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
  
  // Disable trailing slash to prevent redirect issues
  trailingSlash: false,
  
  // Skip trailing slash redirect to prevent infinite loops
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
