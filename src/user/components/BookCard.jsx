import { memo } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/format'
import BookCover from './BookCover'

const BookCard = memo(function BookCard({ book }) {
  return (
    <Link to={`/view/${book.id}/book`} className="group block">
      <div className="overflow-hidden rounded-md shadow-lg shadow-black/40 transition-transform duration-300 group-hover:-translate-y-1.5">
        <BookCover book={book} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-medium text-moon group-hover:text-sakura">{book.title}</h3>
          <p className="line-clamp-1 text-sm text-moon/60">{book.author}</p>
        </div>
        <p className="font-semibold text-sakura">{formatPrice(book.price)}</p>
      </div>
    </Link>
  )
})

export default BookCard
