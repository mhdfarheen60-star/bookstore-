import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faInstagram, faXTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { faArrowRightLong, faBook, faEnvelope, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons'

// Only pages that exist in App.jsx – add more here when you build them.
const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'Books', path: '/all-books' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'Login', path: '/login' },
]

// TODO: replace with your real social profiles.
const socials = [
  { icon: faFacebook, label: 'Facebook', href: 'https://facebook.com/yourpage' },
  { icon: faInstagram, label: 'Instagram', href: 'https://instagram.com/yourpage' },
  { icon: faXTwitter, label: 'X', href: 'https://x.com/yourpage' },
  { icon: faLinkedinIn, label: 'LinkedIn', href: 'https://linkedin.com/company/yourpage' },
]

function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    // TODO: call your newsletter API here
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="bg-panel text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
          {/* About */}
          <div>
            <Link to="/" className="mb-6 flex items-center gap-3" aria-label="Book Store Home">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <FontAwesomeIcon icon={faBook} />
              </span>
              <span className="text-xl font-bold tracking-tight lg:text-2xl">BOOK STORE</span>
            </Link>
            <p className="mb-6 text-sm font-light leading-relaxed text-gray-400 lg:text-base">
              Your trusted destination for discovering amazing books across every genre.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <FontAwesomeIcon icon={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links + contact */}
          <div>
            <h4 className="mb-5 text-base font-semibold lg:text-lg">Quick Links</h4>
            <nav className="space-y-2 lg:space-y-3">
              {quickLinks.map((l) => (
                <Link
                  key={l.name}
                  to={l.path}
                  className="block text-sm font-light text-gray-400 transition-colors hover:text-white lg:text-base"
                >
                  {l.name}
                </Link>
              ))}
            </nav>
            <div className="mt-8 space-y-3 text-sm font-light text-gray-400">
              <p className="flex items-start gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-sakura" />
                123 Library Street, Your City
              </p>
              <p className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} className="text-sakura" />
                +91 00000 00000
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-3 text-base font-semibold lg:text-lg">Newsletter</h4>
            <p className="mb-5 text-sm font-light text-gray-400 lg:text-base">
              Get special offers, giveaways and new-arrival alerts.
            </p>

            {subscribed ? (
              <p role="status" className="text-sm text-sakura">Thanks for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address"
                    placeholder="your@email.com"
                    className="w-full rounded-full border border-white/20 bg-white/10 py-3 pr-4 pl-9 text-white outline-none placeholder:text-gray-400 focus:border-sakura focus:ring-2 focus:ring-sakura/20"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-sakura px-4 py-3 font-semibold text-white transition-colors hover:bg-sakura/80"
                >
                  Subscribe
                  <FontAwesomeIcon icon={faArrowRightLong} className="text-sm" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black/40 py-4 text-center text-sm font-light text-gray-400">
        © {new Date().getFullYear()} BOOK STORE. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
