import { useState } from 'react'
import { Button, Field, Modal, inputClass } from '../components/Ui'
import { emptyBookForm } from './bookFormDefaults'

/** Create/edit form for a book. Owns no fetching – the page does that. */
function BookForm({ initial, categories, saving = false, error = '', onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? emptyBookForm)
  const [localError, setLocalError] = useState('')

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')

    if (!form.title.trim() || !form.author.trim() || !form.description.trim()) {
      setLocalError('Title, author and description are required.')
      return
    }
    if (!form.category) {
      setLocalError('Please choose a category.')
      return
    }

    const price = Number(form.price)
    if (Number.isNaN(price) || price < 0) {
      setLocalError('Please enter a valid price.')
      return
    }

    const stock = Number(form.stock)
    if (Number.isNaN(stock) || stock < 0) {
      setLocalError('Please enter a valid stock quantity.')
      return
    }

    const colors = form.colors.split(',').map((c) => c.trim()).filter(Boolean)

    onSubmit({
      ...form,
      price,
      stock,
      // Empty strings would fail server validation, so send them as undefined.
      originalPrice: form.originalPrice === '' ? undefined : Number(form.originalPrice),
      publishedYear: form.publishedYear === '' ? undefined : Number(form.publishedYear),
      isbn: form.isbn.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
      publisher: form.publisher.trim() || undefined,
      colors: colors.length ? colors : undefined,
    })
  }

  const shownError = error || localError

  return (
    <Modal title={initial ? 'Edit book' : 'Add book'} onClose={onCancel} wide>
      {shownError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {shownError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *">
            <input className={inputClass} value={form.title} onChange={(e) => set({ title: e.target.value })} required />
          </Field>
          <Field label="Author *">
            <input className={inputClass} value={form.author} onChange={(e) => set({ author: e.target.value })} required />
          </Field>
          <Field label="Category *">
            <select className={inputClass} value={form.category} onChange={(e) => set({ category: e.target.value })} required>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="ISBN" hint="Optional, must be unique">
            <input className={inputClass} value={form.isbn} onChange={(e) => set({ isbn: e.target.value })} />
          </Field>
          <Field label="Price (USD) *">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.price}
              onChange={(e) => set({ price: e.target.value })} required />
          </Field>
          <Field label="Original price (USD)" hint="Shown struck-through next to the sale price">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.originalPrice}
              onChange={(e) => set({ originalPrice: e.target.value })} />
          </Field>
          <Field label="Stock *">
            <input type="number" min="0" className={inputClass} value={form.stock}
              onChange={(e) => set({ stock: e.target.value })} required />
          </Field>
          <Field label="Publisher">
            <input className={inputClass} value={form.publisher} onChange={(e) => set({ publisher: e.target.value })} />
          </Field>
          <Field label="Published year">
            <input type="number" min="1000" max={new Date().getFullYear() + 1} className={inputClass}
              value={form.publishedYear} onChange={(e) => set({ publishedYear: e.target.value })} />
          </Field>
          <Field label="Language">
            <input className={inputClass} value={form.language} onChange={(e) => set({ language: e.target.value })} />
          </Field>
        </div>

        <Field label="Description *">
          <textarea rows="4" className={`${inputClass} resize-y`} value={form.description}
            onChange={(e) => set({ description: e.target.value })} required />
        </Field>

        <Field label="Cover image URL" hint="Leave empty to fall back to the generated cover">
          <input className={inputClass} value={form.coverImage}
            onChange={(e) => set({ coverImage: e.target.value })} placeholder="https://..." />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cover colours" hint="Two comma-separated hex values">
            <input className={inputClass} value={form.colors} onChange={(e) => set({ colors: e.target.value })} />
          </Field>
          <Field label="Cover glyph" hint="Single character used on generated covers">
            <input className={inputClass} maxLength="2" value={form.glyph} onChange={(e) => set({ glyph: e.target.value })} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })}
            className="h-4 w-4 accent-[#3157d5]" />
          Feature on the home page
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button busy={saving} onClick={handleSubmit}>
            {initial ? 'Save changes' : 'Create book'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default BookForm
