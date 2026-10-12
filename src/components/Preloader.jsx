// Lightweight fallback shown only while a page chunk loads (pure CSS, no network request).
function Preloader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white" role="status" aria-label="Loading">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy-100 border-t-navy-900" />
    </div>
  )
}

export default Preloader
