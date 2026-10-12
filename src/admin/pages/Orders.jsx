import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faSearch } from '@fortawesome/free-solid-svg-icons'
import { api } from '../../api/client'
import { useAsync } from '../hooks/useAsync'
import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  Pagination,
  Spinner,
  StatusBadge,
  Table,
  Toolbar,
  inputClass,
} from '../components/Ui'
import { formatMoney, formatNumber, formatDate } from '../utils/format'

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

function Orders() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null) // order being inspected
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState({ tone: '', message: '' })

  const { data, loading, error, reload } = useAsync(
    async () => {
      const res = await api.getAllOrders({ search: search || undefined, status: status || undefined, page, limit: 20 })
      if (!res.success) throw new Error(res.message || 'Failed to load orders')
      return res.data
    },
    [search, status, page],
  )

  const orders = data?.orders ?? []
  const pagination = data?.pagination

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

  const openDetail = async (order) => {
    setDetail(order)
    // Pull the full document so shipping address and line items are complete.
    try {
      const res = await api.getAdminOrderById(order._id)
      if (res.success) setDetail(res.data.order)
    } catch {
      // Keep the list-level summary if the detail call fails.
    }
  }

  const updateStatus = async (patch) => {
    if (!detail) return
    setSaving(true)
    try {
      const res = await api.updateOrderStatus(detail._id, patch)
      if (res.success) {
        setFlash({ tone: 'success', message: 'Order updated' })
        setDetail(res.data.order)
        reload()
      } else {
        setFlash({ tone: 'error', message: res.message || 'Could not update the order' })
      }
    } catch (err) {
      setFlash({ tone: 'error', message: err.message || 'Could not update the order' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-sm text-slate-400">
          {pagination ? `${formatNumber(pagination.totalOrders)} order(s)` : 'Track and fulfil customer orders'}
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
            aria-label="Search orders"
            placeholder="Search by order number or customer"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          aria-label="Filter by status"
          className={`${inputClass} sm:max-w-48`}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </Toolbar>

      {loading ? (
        <Spinner label="Loading orders..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          hint="Orders appear here as soon as a customer checks out."
        />
      ) : (
        <>
          <Table head={['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', '']}>
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-700">#{String(o.orderNumber || o._id).slice(-8)}</p>
                  <p className="text-xs text-slate-400">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{o.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">{o.user?.email || ''}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{o.itemCount ?? o.items?.length ?? 0}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{formatMoney(o.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={o.paymentStatus} />
                  <p className="mt-0.5 text-[10px] text-slate-400 uppercase">{o.paymentMethod}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={o.status} />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openDetail(o)}
                    aria-label={`View order ${String(o.orderNumber || o._id).slice(-8)}`}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination page={page} totalPages={pagination?.totalPages ?? 1} onChange={setPage} />
        </>
      )}

      {detail && (
        <Modal title={`Order #${String(detail.orderNumber || detail._id).slice(-8)}`} onClose={() => setDetail(null)} wide>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Placed</p>
                <p className="mt-1 text-sm text-slate-700">{formatDate(detail.createdAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Payment</p>
                <p className="mt-1 text-sm text-slate-700 uppercase">
                  {detail.paymentMethod} · {detail.paymentStatus}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Status</p>
                <div className="mt-1">
                  <StatusBadge value={detail.status} />
                </div>
              </div>
            </div>

            {detail.shippingAddress && (
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Ship to</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{detail.shippingAddress.name}</p>
                <p className="text-sm text-slate-600">
                  {detail.shippingAddress.street}, {detail.shippingAddress.city},{' '}
                  {detail.shippingAddress.state} {detail.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-slate-600">{detail.shippingAddress.country}</p>
                <p className="mt-1 text-sm text-slate-500">{detail.shippingAddress.phone}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-[11px] font-bold tracking-wide text-slate-400 uppercase">Items</p>
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {(detail.items ?? []).map((item, i) => (
                  <li key={item.book || i} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-400">
                        {item.author} · {formatMoney(item.price)} each
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-slate-600">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatMoney(detail.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{detail.shippingFee === 0 ? 'Free' : formatMoney(detail.shippingFee)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatMoney(detail.tax)}</span></div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                <span>Total</span><span>{formatMoney(detail.total)}</span>
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
              <Field label="Order status">
                <select
                  className={inputClass}
                  value={detail.status}
                  onChange={(e) => updateStatus({ status: e.target.value })}
                  disabled={saving}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Payment status">
                <select
                  className={inputClass}
                  value={detail.paymentStatus}
                  onChange={(e) => updateStatus({ paymentStatus: e.target.value })}
                  disabled={saving}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Orders
