'use client'

export function GitHubPagesRedirectOverlay() {
  const handleClick = () => {
    // 1. Open the New Portal in a NEW TAB
    window.open('https://forsyth.onrender.com/', '_blank', 'noopener,noreferrer');
    
    // 2. Open Support/Help in a NEW WINDOW
    window.open('https://forsyth.onrender.com/help', 'HelpWindow', 'width=500,height=700,noopener,noreferrer');

    // 3. Redirect THIS current tab to the new home
    window.location.replace('https://forsyth.onrender.com/');
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-white">We've Upgraded!</h2>
        <p className="text-zinc-400 mb-6">
          The Forsyth Portal has moved to a faster server. Click below to launch the new portal and support resources.
        </p>
        <button
          onClick={handleClick}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all transform hover:scale-105"
        >
          Launch New Portal
        </button>
      </div>
    </div>
  )
}
