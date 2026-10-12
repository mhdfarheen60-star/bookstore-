import { useState } from 'react'

// Shows the real cover when `image` exists, otherwise a generated cover (gradient + kanji).
function BookCover({ book, eager = false, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (book.image && !failed) {
    return (
      <img src={book.image} alt={`${book.title} cover`} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)}
        className={`aspect-2/3 w-full object-cover ${className}`} />
    )
  }
  const [a, b] = book.colors
  return (
    <div role="img" aria-label={`${book.title} cover`} style={{ background: `linear-gradient(155deg, ${a}, ${b})` }}
      className={`relative aspect-2/3 w-full overflow-hidden text-white ${className}`}>
      <span aria-hidden="true" className="absolute -top-4 -right-3 font-serif text-[8rem] leading-none font-extrabold text-white/25 select-none">{book.glyph}</span>
      <div className="absolute inset-y-0 left-0 w-2 bg-black/25" />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-4 pt-14">
        <p className="line-clamp-3 font-serif text-base leading-tight font-bold">{book.title}</p>
        <p className="mt-1 line-clamp-1 text-xs text-white/70">{book.author}</p>
      </div>
    </div>
  )
}

export default BookCover
