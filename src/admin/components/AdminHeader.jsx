import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faSignOutAlt, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/useAuth'

// Top bar of the admin panel. `onMenu` opens the drawer on small screens.
function AdminHeader({ onMenu }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open admin menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <Link to="/" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-[#3157d5]">
          <FontAwesomeIcon icon={faChevronLeft} />
          <span className="hidden sm:inline">Back to store</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">{user?.name || 'Admin'}</p>
          <p className="text-[11px] text-slate-400">Administrator</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9edff] text-sm font-bold text-[#3157d5]">
          {(user?.name || 'A').charAt(0).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default AdminHeader
