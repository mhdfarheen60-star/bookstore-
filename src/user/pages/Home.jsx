import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { books, genres, getBookById, transformBooks } from '../../data/books'
import { formatPrice } from '../../utils/format'
import BookCard from '../components/BookCard'
import BookCover from '../components/BookCover'
import { api } from '../../api/client'

const fan = [11, 15, 9].map((id) => getBookById(id)) // hero cover fan — never pass getBookById directly to map, it would receive the index as the 2nd (booksArray) argument
const spotlight = getBookById(6)

const perks = [
  { title: 'Authentic editions only', text: 'Every volume is an official licensed release. No bootlegs, ever.' },
  { title: 'Ships in 48 hours', text: 'Orders are packed in protective sleeves and dispatched within two days.' },
  { title: 'Sell your own volumes', text: 'Finished a series? List it from your profile and pass it to the next reader.' },
]

const reviews = [
  { name: 'Aiko M.', text: 'My Berserk deluxe arrived sealed and flawless. Found two series here I could not get anywhere else.' },
  { name: 'Rohan K.', text: 'Search by genre is what I wanted. Went from Vinland Saga to Vagabond in one evening.' },
  { name: 'Sana P.', text: 'Fast delivery and the listing photos matched the book exactly. Selling my old volumes was easy too.' },
]

function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [trendingBooks, setTrendingBooks] = useState([])
  const [apiGenres, setApiGenres] = useState([])

  const search = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/all-books?search=${encodeURIComponent(q)}` : '/all-books')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, categoriesRes] = await Promise.all([
          api.getFeaturedBooks(8),
          api.getCategories(),
        ]);
        if (featuredRes.success) {
          setTrendingBooks(transformBooks(featuredRes.data.books));
        } else {
          // Fallback to local data
          setTrendingBooks(books.filter((b) => b.trending));
        }
        if (categoriesRes.success) {
          setApiGenres(categoriesRes.data.categories.map((c) => c.name).sort());
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
        setTrendingBooks(books.filter((b) => b.trending));
      }
    };
    fetchData();
  }, []);

  const displayGenres = apiGenres.length > 0 ? apiGenres : genres;
  const displayTrending = trendingBooks.length > 0 ? trendingBooks : books.filter((b) => b.trending);

  return (
    <div className="bg-ink text-moon">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <span aria-hidden="true" className="pointer-events-none absolute -top-10 right-[-2rem] font-serif text-[26rem] leading-none font-extrabold text-sakura/6 select-none [writing-mode:vertical-rl]">漫画</span>
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="font-serif text-5xl leading-[1.05] font-extrabold sm:text-7xl">Your next obsession is on the shelf.</h1>
            <p className="mt-6 max-w-lg text-lg text-moon/70">Manga, light novels and deluxe editions, from long-running shonen to award-winning seinen. Search {books.length} titles across {displayGenres.length} genres.</p>
            <form onSubmit={search} role="search" className="mt-8 flex max-w-lg overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 focus-within:ring-sakura">
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search books"
                placeholder="Try “Berserk”, “romance” or an author" className="min-w-0 flex-1 bg-transparent px-5 py-3.5 outline-none placeholder:text-moon/40" />
              <button type="submit" className="bg-sakura px-6 font-semibold text-white hover:bg-sakura/85">Search</button>
            </form>
          </div>

          <div className="relative mx-auto hidden h-105 w-full max-w-md lg:block" aria-hidden="true">
            {fan.map((book, i) => (
              <div key={book.id} className="animate-fan absolute w-52 overflow-hidden rounded-md shadow-2xl shadow-black/60"
                style={{ left: `${i * 26}%`, top: `${i === 1 ? 0 : 12}%`, rotate: `${(i - 1) * 9}deg`, zIndex: i === 1 ? 2 : 1, animationDelay: `${i * 140}ms` }}>
                <BookCover book={book} eager />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENRE STRIP */}
      <nav aria-label="Browse by genre" className="border-y border-white/10 bg-panel/60">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 py-4">
          {displayGenres.map((g) => (
            <Link key={g} to={`/all-books?genre=${encodeURIComponent(g)}`} className="shrink-0 rounded-full border border-white/15 px-4 py-1.5 text-sm hover:border-sakura hover:text-sakura">{g}</Link>
          ))}
        </div>
      </nav>

      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-4xl font-extrabold">Trending this week</h2>
            <p className="mt-2 text-moon/60">What readers are ordering right now.</p>
          </div>
          <Link to="/all-books" className="text-sakura hover:underline">Browse all {books.length} books</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {displayTrending.map((b) => <BookCard key={b.id || b._id} book={b} />)}
        </div>
      </section>

      {/* SPOTLIGHT */}
      <section className="bg-panel">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 md:grid-cols-[280px_1fr]">
          <div className="mx-auto w-56 overflow-hidden rounded-md shadow-2xl shadow-black/60 md:w-full"><BookCover book={spotlight} /></div>
          <div>
            <p className="text-sm text-sakura">Editor&apos;s pick</p>
            <h2 className="mt-2 font-serif text-4xl font-extrabold">{spotlight.title}</h2>
            <p className="mt-1 text-moon/60">{spotlight.author}</p>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-moon/80">{spotlight.description} Tight plotting, a huge emotional range and a finale that holds up on every re-read.</p>
            <Link to={`/view/${spotlight.id}/book`} className="mt-8 inline-block rounded-full bg-sakura px-8 py-3 font-semibold text-white hover:bg-sakura/85">View book · {formatPrice(spotlight.price)}</Link>
          </div>
        </div>
      </section>

      {/* SHELF MARQUEE */}
      <section className="overflow-hidden py-16" aria-label="More on our shelves">
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
          {[...books, ...books].map((b, i) => (
            <Link key={`${b.id}-${i}`} to={`/view/${b.id}/book`} tabIndex={i >= books.length ? -1 : 0} aria-hidden={i >= books.length} className="block w-36 shrink-0 overflow-hidden rounded-md opacity-80 transition-opacity hover:opacity-100">
              <BookCover book={b} />
            </Link>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 md:grid-cols-3">
        {perks.map((p) => (
          <div key={p.title} className="border-l-2 border-sakura pl-5">
            <h3 className="font-serif text-xl font-bold">{p.title}</h3>
            <p className="mt-2 text-moon/65">{p.text}</p>
          </div>
        ))}
      </section>

      {/* REVIEWS */}
      <section className="bg-panel px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-4xl font-extrabold">Readers say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="rounded-xl bg-ink p-6 ring-1 ring-white/10">
                <blockquote className="leading-relaxed text-moon/80">{r.text}</blockquote>
                <figcaption className="mt-5 font-semibold text-sakura">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home