import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faXmark,
  faMagnifyingGlass,
  faBook,
  faUser,
  faShoppingCart,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/useCart'

const menuLinks = [
  { name: 'Home', to: '/' },
  { name: 'Books', to: '/all-books' },
  { name: 'Contact', to: '/contact' },
]

function UserHeader({ overlay = false, announcement }) {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { cart } = useCart()
  const [scrolled, setScrolled] = useState(() => window.scrollY > 40)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const solid = !overlay || scrolled || menuOpen || searchOpen

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/all-books?search=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setQuery('')
  }

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  return (
    <header
      className={`${overlay ? 'fixed inset-x-0 top-0' : 'sticky top-0'} z-50 text-white`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${solid ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-linear-to-b from-black/60 to-transparent transition-opacity duration-300 ${solid ? 'opacity-0' : 'opacity-100'}`}
      />

      <div className="relative">
        {announcement && !scrolled && (
          <div className="bg-white text-black text-center text-xs sm:text-sm py-2 px-4">
            {announcement}
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setMenuOpen(true); }}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label="Open menu"
              className="flex items-center gap-2 text-sm hover:text-sakura"
            >
              <FontAwesomeIcon icon={faBars} />
              <span className="hidden sm:inline">Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              aria-label="Search"
              className="flex items-center gap-2 text-sm hover:text-sakura"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          <Link to="/" aria-label="Book Store home" className="flex items-center gap-2 text-base sm:text-xl font-light tracking-[0.2em]">
            <FontAwesomeIcon icon={faBook} className="text-sakura text-base" />
            BOOK STORE
          </Link>

          <div className="flex items-center justify-end gap-5">
            {isAuthenticated ? (
              <>
                <Link to="/cart" aria-label="Shopping Cart" className="flex items-center gap-2 text-sm hover:text-sakura relative">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span className="hidden sm:inline">Cart</span>
                  {cart.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sakura text-xs font-bold text-white">
                      {cart.itemCount > 99 ? '99+' : cart.itemCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" aria-label="Profile" className="flex items-center gap-2 text-sm hover:text-sakura">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="hidden sm:inline">{user?.name || 'Profile'}</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin-dashboard" aria-label="Admin Dashboard" className="flex items-center gap-2 text-sm hover:text-sakura">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm hover:text-sakura"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" aria-label="Login" className="flex items-center gap-2 text-sm hover:text-sakura">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} role="search" className="border-t border-white/10">
            <div className="flex items-center gap-4 h-16 px-4 sm:px-6 lg:px-12">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/60" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search books, authors or genres"
                placeholder="Search for books, authors, genres"
                className="flex-1 min-w-0 bg-transparent text-lg font-light outline-none placeholder-white/50"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-white/70 hover:text-white">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </form>
        )}
      </div>

      {menuOpen && (
        <div id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-[60] bg-black text-white flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-12">
            <button type="button" onClick={closeMenu} className="flex items-center gap-2 text-sm hover:text-sakura">
              <FontAwesomeIcon icon={faXmark} />
              Close
            </button>
            <span className="text-base sm:text-xl font-light tracking-[0.2em]">BOOK STORE</span>
            <span className="w-16" aria-hidden="true" />
          </div>

          <nav className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12" aria-label="Main">
            {menuLinks.map((link) => (
              <Link key={link.name} to={link.to} onClick={closeMenu} className="py-1 text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white/90 hover:text-sakura">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-12 py-8 text-sm text-white/70">
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="hover:text-white">Profile</Link>
                <Link to="/cart" onClick={closeMenu} className="hover:text-white">Cart</Link>
                {isAdmin && <Link to="/admin-dashboard" onClick={closeMenu} className="hover:text-white">Admin Dashboard</Link>}
                <button onClick={handleLogout} className="hover:text-white text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="hover:text-white">Login</Link>
                <Link to="/signup" onClick={closeMenu} className="hover:text-white">Create account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default UserHeader