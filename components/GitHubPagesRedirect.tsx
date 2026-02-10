/**
 * GitHubPagesRedirect Component
 * 
 * SUPER FAST redirect from GitHub Pages to Render deployment.
 * Uses inline blocking script that executes immediately when parsed.
 * No React hydration delay - redirects before page renders.
 */
export function GitHubPagesRedirect() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `if(window.location.hostname==='forsyth-county.github.io'&&window.location.pathname.startsWith('/portal/'))window.location.replace('https://forsyth.onrender.com/');`,
      }}
    />
  )
}
