import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons'
import { api } from '../../api/client'
import BookCover from '../../user/components/BookCover'
import { useAsync } from '../hooks/useAsync'
import BookForm from './BookForm'
import { emptyBookForm } from './bookFormDefaults'
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
import { formatMoney, formatNumber } from '../utils/format'
import { transformBook } from '../../data/books'

// "…?search=a&page=2" -> { search: 'a', category: '', page: 2 }
const readParams = (search) => {
  const p = new URLSearchParams(search)
  return {
    search: p.get('search') ?? '',
    category: p.get('category') ?? '',
    page: Number(p.get('page') ?? 1),
  }
}

function Books() {
  const [params, setParams] = useState(() => readParams(window.location.search))
  const [editing, setEditing] = useState(null) // book being edited, or null
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [flash, setFlash] = useState({ tone: '', message: '' })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Reflect filter state in the URL so the module is shareable/bookmarkable.
  useEffect(() => {
    const onPop = () => setParams(readParams(window.location.search))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const update = (patch) => {
    const next = { ...params, ...patch }
    // Any filter change should send you back to page 1.
    if ((patch.search !== undefined || patch.category !== undefined) && patch.page === undefined) {
      next.page = 1
    }
    const p = new URLSearchParams()
    if (next.search) p.set('search', next.search)
    if (next.category) p.set('category', next.category)
    if (next.page > 1) p.set('page', String(next.page))

    const qs = p.toString()
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
    setParams(next)
  }

  const { data, loading, error, reload } = useAsync(
    async () => {
      const [booksRes, catRes] = await Promise.all([
        // includeInactive lets an admin see and reactivate deactivated books.
        api.getBooks({ ...params, includeInactive: 'true', limit: 20 }),
        api.getCategories({ includeInactive: 'true' }),
      ])
      if (!booksRes.success) throw new Error(booksRes.message || 'Failed to load books')
      return {
        books: (booksRes.data.books || []).map(transformBook),
        pagination: booksRes.data.pagination,
        categories: catRes.success ? catRes.data.categories : [],
      }
    },
    [params.search, params.category, params.page],
  )

  const categories = data?.categories ?? []
  const books = data?.books ?? []
  const pagination = data?.pagination

  const openCreate = () => {
    setEditing(null)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (book) => {
    setEditing({
      ...emptyBookForm,
      title: book.title ?? '',
      author: book.author ?? '',
      description: book.description ?? '',
      price: book.price ?? '',
      originalPrice: book.originalPrice ?? '',
      coverImage: book.image ?? '',
      category: book.category?._id ?? book.category ?? '',
      isbn: book.isbn ?? '',
      publisher: book.publisher ?? '',
      publishedYear: book.publishedYear ?? '',
      stock: book.stock ?? 0,
      language: book.language ?? 'English',
      featured: Boolean(book.trending),
      colors: (book.colors ?? ['#3b2a20', '#8a3b2b']).join(', '),
      glyph: book.glyph ?? '?',
    })
    setFormError('')
    setFormOpen(true)
  }

  const handleSave = async (payload) => {
    setSaving(true)
    setFormError('')
    try {
      const res = editing?.id ? await api.updateBook(editing.id, payload) : await api.createBook(payload)
      if (res.success) {
        setFlash({ tone: 'success', message: editing?.id ? 'Book updated' : 'Book created' })
        setFormOpen(false)
        setEditing(null)
        reload()
      } else {
        setFormError(res.message || 'Could not save the book')
      }
    } catch (err) {
      setFormError(err.message || 'Could not save the book')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const res = await api.deleteBook(pendingDelete.id)
      if (res.success) {
        setFlash({ tone: 'success', message: `"${pendingDelete.title}" deleted` })
        setPendingDelete(null)
        reload()
      } else {
        setFlash({ tone: 'error', message: res.message || 'Could not delete the book' })
      }
    } catch (err) {
      setFlash({ tone: 'error', message: err.message || 'Could not delete the book' })
    } finally {
      setDeleting(false)
    }
  }

  const toggleActive = async (book) => {
    try {
      const res = await api.updateBook(book.id, { isActive: book.isActive === false })
      if (res.success) {
        setFlash({
          tone: 'success',
          message: book.isActive === false ? 'Book reactivated' : 'Book hidden from the store',
        })
        reload()
      } else {
        setFlash({ tone: 'error', message: res.message || 'Could not update the book' })
      }
    } catch (err) {
      setFlash({ tone: 'error', message: err.message || 'Could not update the book' })
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold">Books</h1>
          <p className="mt-1 text-sm text-slate-400">
            {pagination ? `${formatNumber(pagination.totalBooks)} book(s) in the catalogue` : 'Manage your catalogue'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <FontAwesomeIcon icon={faPlus} />
          Add book
        </Button>
      </div>

      <Alert tone={flash.tone} message={flash.message} onDismiss={() => setFlash({ tone: '', message: '' })} />

      <Toolbar>
        <div className="relative flex-1 sm:max-w-sm">
          <FontAwesomeIcon icon={faSearch} className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-slate-400" />
          <input
            type="search"
            value={params.search}
            onChange={(e) => update({ search: e.target.value })}
            aria-label="Search books"
            placeholder="Search title, author or description"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={params.category}
          onChange={(e) => update({ category: e.target.value })}
          aria-label="Filter by category"
          className={`${inputClass} sm:max-w-56`}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </Toolbar>

      {loading ? (
        <Spinner label="Loading books..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          hint="Try a different search or category, or add your first book."
          action={
            <Button onClick={openCreate} className="mt-2">
              <FontAwesomeIcon icon={faPlus} />
              Add book
            </Button>
          }
        />
      ) : (
        <>
          <Table head={['Book', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
            {books.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 shrink-0 overflow-hidden rounded">
                      <BookCover book={b} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-700">{b.title}</p>
                      <p className="truncate text-xs text-slate-400">{b.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{b.genre || '—'}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">
                  {formatMoney(b.price)}
                  {b.discountPercent > 0 && (
                    <span className="ml-1.5 text-xs font-medium text-emerald-600">-{b.discountPercent}%</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${b.stock === 0 ? 'text-red-600' : b.stock <= 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {formatNumber(b.stock)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge value={b.isActive === false ? 'inactive' : 'active'} />
                    {b.trending && <span className="text-[10px] font-semibold text-purple-600">Featured</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/view/${b.id}/book`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      aria-label={`Edit ${b.title}`}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(b)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {b.isActive === false ? 'Activate' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(b)}
                      aria-label={`Delete ${b.title}`}
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination page={params.page} totalPages={pagination?.totalPages ?? 1} onChange={(page) => update({ page })} />
        </>
      )}

      {formOpen && (
        <BookForm
          initial={editing}
          categories={categories}
          saving={saving}
          error={formError}
          onSubmit={handleSave}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
            setFormError('')
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete book"
          message={`"${pendingDelete.title}" will be permanently removed. This cannot be undone.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

export default Books
