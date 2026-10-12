import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { api } from '../../api/client'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../../context/useAuth'
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Pagination,
  Spinner,
  StatusBadge,
  Table,
  Toolbar,
  inputClass,
} from '../components/Ui'
import { formatNumber, formatDate } from '../utils/format'

function Users() {
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [flash, setFlash] = useState({ tone: '', message: '' })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState(null)

  // Debounce the search box so we don't fire a request per keystroke.
  const [searchInput, setSearchInput] = useState('')
  const onSearchChange = (value) => {
    setSearchInput(value)
    clearTimeout(onSearchChange.t)
    onSearchChange.t = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 350)
  }

  const { data, loading, error, reload } = useAsync(
    async () => {
      const res = await api.getAllUsers({ search: search || undefined, role: role || undefined, page, limit: 20 })
      if (!res.success) throw new Error(res.message || 'Failed to load users')
      return res.data
    },
    [search, role, page],
  )

  const users = data?.users ?? []
  const pagination = data?.pagination

  const patchUser = async (user, patch, successMessage) => {
    setBusyId(user._id)
    try {
      const res = await api.updateUser(user._id, patch)
      if (res.success) {
        setFlash({ tone: 'success', message: successMessage })
        reload()
      } else {
        setFlash({ tone: 'error', message: res.message || 'Could not update the user' })
      }
    } catch (err) {
      setFlash({ tone: 'error', message: err.message || 'Could not update the user' })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const res = await api.deleteUser(pendingDelete._id)
      if (res.success) {
        setFlash({ tone: 'success', message: `"${pendingDelete.name}" deleted` })
        setPendingDelete(null)
        reload()
      } else {
        setFlash({ tone: 'error', message: res.message || 'Could not delete the user' })
      }
    } catch (err) {
      setFlash({ tone: 'error', message: err.message || 'Could not delete the user' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-slate-400">
          {pagination ? `${formatNumber(pagination.totalUsers)} registered account(s)` : 'Manage customer accounts'}
        </p>
      </div>

      <Alert tone={flash.tone} message={flash.message} onDismiss={() => setFlash({ tone: '', message: '' })} />

      <Toolbar>
        <div className="relative flex-1 sm:max-w-sm">
          <FontAwesomeIcon icon={faSearch} className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search users"
            placeholder="Search by name or email"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value)
            setPage(1)
          }}
          aria-label="Filter by role"
          className={`${inputClass} sm:max-w-48`}
        >
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </Toolbar>

      {loading ? (
        <Spinner label="Loading users..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" hint="Try a different search or role filter." />
      ) : (
        <>
          <Table head={['User', 'Role', 'Joined', 'Status', 'Actions']}>
            {users.map((u) => {
              const isSelf = currentUser?.id === u._id
              return (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-700">
                      {u.name}
                      {isSelf && <span className="ml-2 text-[10px] font-bold text-[#3157d5] uppercase">You</span>}
                    </p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={u.role} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={u.isActive === false ? 'inactive' : 'active'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        busy={busyId === u._id}
                        onClick={() =>
                          patchUser(
                            u,
                            { isActive: u.isActive === false },
                            u.isActive === false ? 'Account reactivated' : 'Account deactivated',
                          )
                        }
                      >
                        {u.isActive === false ? 'Activate' : 'Deactivate'}
                      </Button>
                      <Button
                        variant="ghost"
                        busy={busyId === u._id}
                        onClick={() =>
                          patchUser(
                            u,
                            { role: u.role === 'admin' ? 'customer' : 'admin' },
                            u.role === 'admin' ? 'Demoted to customer' : 'Promoted to admin',
                          )
                        }
                      >
                        {u.role === 'admin' ? 'Make customer' : 'Make admin'}
                      </Button>
                      <Button
                        variant="danger"
                        busy={deleting && pendingDelete?._id === u._id}
                        onClick={() => setPendingDelete(u)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </Table>

          <Pagination page={page} totalPages={pagination?.totalPages ?? 1} onChange={setPage} />
        </>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete user"
          message={`"${pendingDelete.name}" will be permanently deleted. Their order history stays on record. This cannot be undone.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

export default Users
