import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBookById, transformBook, relatedBooks } from '../../data/books'
import { formatPrice } from '../../utils/format'
import BookCard from '../components/BookCard'
import BookCover from '../components/BookCover'
import { api } from '../../api/client'

function ViewBook() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.getBookById(id);
        if (response.success) {
          const transformed = transformBook(response.data.book);
          setBook(transformed);
          if (response.data.relatedBooks) {
            setRelated(response.data.relatedBooks.map(transformBook));
          }
        } else {
          // Fallback to local data
          const localBook = getBookById(id);
          if (localBook) {
            setBook(localBook);
            setRelated(relatedBooks(localBook));
          } else {
            setError('Book not found');
          }
        }
      } catch (err) {
        console.error('Failed to fetch book:', err);
        const localBook = getBookById(id);
        if (localBook) {
          setBook(localBook);
          setRelated(relatedBooks(localBook));
        } else {
          setError('Book not found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <section className="bg-ink px-6 py-24 text-center text-moon">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura border-t-transparent mx-auto" />
        <p className="mt-4 text-moon/60">Loading book details...</p>
      </section>
    );
  }

  if (error || !book) {
    return (
      <section className="bg-ink px-6 py-24 text-center text-moon">
        <h1 className="font-serif text-3xl font-extrabold">We couldn&apos;t find that book</h1>
        <Link to="/all-books" className="mt-6 inline-block rounded-full bg-sakura px-6 py-2.5 font-semibold text-white">Browse all books</Link>
      </section>
    );
  }

  return (
    <div className="bg-ink text-moon">
      <section className="mx-auto max-w-5xl px-6 py-14">
        <Link to="/all-books" className="text-sm text-sakura hover:underline">Back to all books</Link>
        <div className="mt-8 grid gap-12 md:grid-cols-[300px_1fr]">
          <div className="mx-auto w-64 overflow-hidden rounded-md shadow-2xl shadow-black/60 md:w-full"><BookCover book={book} eager /></div>
          <div>
            <p className="text-sakura">{book.genre}</p>
            <h1 className="mt-1 font-serif text-4xl font-extrabold">{book.title}</h1>
            <p className="mt-2 text-moon/60">by {book.author}</p>
            <p className="mt-4 text-moon/80">{'★'.repeat(Math.round(book.rating))} <span className="text-moon/60">{book.rating} / 5</span></p>
            <p className="mt-6 text-3xl font-semibold">{formatPrice(book.price)}</p>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-moon/80">{book.description}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="font-serif text-3xl font-extrabold">You might also like</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {related.map((b) => <BookCard key={b.id || b._id} book={b} />)}
        </div>
      </section>
    </div>
  )
}

export default ViewBook