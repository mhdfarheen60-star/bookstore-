import { useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { books, genres, transformBooks } from '../../data/books'
import BookCard from '../components/BookCard'
import { api } from '../../api/client'

const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  rating: { label: 'Top rated', fn: (a, b) => b.rating - a.rating },
  low: { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  high: { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
}

function AllBooks() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const genre = params.get('genre') ?? ''
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured'
  const [apiBooks, setApiBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalBooks, setTotalBooks] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value && value !== 'featured') next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = {
        search: search || undefined,
        category: genre || undefined,
        sort: sort === 'featured' ? 'createdAt' : sort,
        order: sort === 'low' ? 'asc' : 'desc',
        page: currentPage,
        limit: 20,
      };
      const response = await api.getBooks(searchParams);
      if (response.success) {
        setApiBooks(transformBooks(response.data.books));
        setTotalBooks(response.data.pagination.totalBooks);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        // Fallback to local filtering
        const filtered = books
          .filter((b) => (!genre || b.genre === genre) && (!search || `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(search.toLowerCase())))
          .sort(SORTS[sort].fn);
        setApiBooks(filtered);
        setTotalBooks(filtered.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      // Fallback to local filtering
      const filtered = books
        .filter((b) => (!genre || b.genre === genre) && (!search || `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(search.toLowerCase())))
        .sort(SORTS[sort].fn);
      setApiBooks(filtered);
      setTotalBooks(filtered.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [search, genre, sort, currentPage]);

  // Reload whenever a filter or page changes. The fetch lives inside the effect
  // because it depends on the current URL params.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch
    fetchBooks();
  }, [fetchBooks]);

  const handlePageChange = (page) => {
    const next = new URLSearchParams(params);
    if (page > 1) next.set('page', page);
    else next.delete('page');
    setParams(next, { replace: true });
  };

  const chip = (active) => `shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? 'border-sakura bg-sakura text-white' : 'border-white/15 text-moon hover:border-sakura hover:text-sakura'}`;

  const displayBooks = apiBooks.length > 0 ? apiBooks : books.filter((b) => (!genre || b.genre === genre) && (!search || `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(search.toLowerCase()))).sort(SORTS[sort].fn);
  const displayGenres = genres;

  return (
    <div className="bg-ink text-moon">
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h1 className="font-serif text-5xl font-extrabold">All books</h1>
        <p className="mt-2 text-moon/60">{totalBooks} of {books.length} titles</p>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
          <input type="search" value={search} onChange={(e) => update('search', e.target.value)} aria-label="Search books"
            placeholder="Search title, author or genre" className="w-full rounded-full bg-white/10 px-5 py-2.5 ring-1 ring-white/15 outline-none placeholder:text-moon/40 focus:ring-sakura md:max-w-sm" />
          <label className="flex items-center gap-2 text-sm text-moon/70 md:ml-auto">
            Sort by
            <select value={sort} onChange={(e) => update('sort', e.target.value)} className="rounded-full bg-panel px-4 py-2 text-moon ring-1 ring-white/15">
              {Object.entries(SORTS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-2" role="group" aria-label="Filter by genre">
          <button type="button" onClick={() => update('genre', '')} aria-pressed={!genre} className={chip(!genre)}>All</button>
          {displayGenres.map((g) => <button key={g} type="button" onClick={() => update('genre', g)} aria-pressed={genre === g} className={chip(genre === g)}>{g}</button>)}
        </div>

        {loading ? (
          <div className="mt-16 text-center text-moon/60">Loading books...</div>
        ) : displayBooks.length ? (
          <>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {displayBooks.map((b) => <BookCard key={b.id || b._id} book={b} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-white/15 text-moon hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-moon/70">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-white/15 text-moon hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg">No books match those filters.</p>
            <button type="button" onClick={() => setParams({}, { replace: true })} className="mt-4 rounded-full bg-sakura px-6 py-2.5 font-semibold text-white">Clear filters</button>
          </div>
        )}
      </section>
    </div>
  )
}

export default AllBooks