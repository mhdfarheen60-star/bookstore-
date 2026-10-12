import { Outlet } from 'react-router-dom'
import Footer from '../../components/Footer'
import UserHeader from './UserHeader'

// One header + one footer for every public page (no more duplicated <Footer /> per page).
function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <UserHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UserLayout
