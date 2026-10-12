// Sample catalogue (prices in USD, ratings are placeholder data). Swap for an API later.
// `image` is optional: books without one get a generated cover (colors + glyph).
export const books = [
  { id: 1, colors: ['#f2c230', '#c1272d'], glyph: '拳', title: 'One-Punch Man, Vol. 6', author: 'ONE', price: 18, genre: 'Action', rating: 4.7, trending: true,
    image: 'https://m.media-amazon.com/images/I/814BNvQBD9L._SY466_.jpg',
    description: 'Saitama can defeat any enemy with a single punch, and the lack of a real challenge is starting to bore him.' },
  { id: 2, colors: ['#1b1464', '#7b2ff7'], glyph: '呪', title: 'Jujutsu Kaisen, Vol. 4', author: 'Gege Akutami', price: 20, genre: 'Supernatural', rating: 4.8, trending: true,
    image: 'https://m.media-amazon.com/images/I/71vhbK3-YvL._SY466_.jpg',
    description: 'Yuji Itadori swallows a cursed finger and joins Tokyo Jujutsu High to fight the curses hunting humanity.' },
  { id: 3, colors: ['#b3121a', '#1a237e'], glyph: '蜘', title: 'Spider-Man: Original Manga - Shadow Warrior', author: 'Kazuki Takahashi', price: 22, genre: 'Action', rating: 4.2,
    image: 'https://m.media-amazon.com/images/I/81K69wZciiL._SY466_.jpg',
    description: 'The original Spider-Man manga collection, Shadow Warrior.' },
  { id: 4, colors: ['#0b3d2e', '#2fbf71'], glyph: '鬼', title: 'Demon Slayer: Kimetsu no Yaiba, Vol. 2', author: 'Koyoharu Gotouge', price: 18, genre: 'Action', rating: 4.7,
    image: 'https://m.media-amazon.com/images/I/51GKLFxjM5L._SY445_SX342_FMwebp_.jpg',
    description: 'Tanjiro trains to become a demon slayer so he can turn his sister Nezuko back into a human.' },
  { id: 5, title: 'Attack on Titan, Vol. 1', author: 'Hajime Isayama', price: 12, genre: 'Dark Fantasy', rating: 4.8, trending: true, colors: ['#3b2a20', '#8a3b2b'], glyph: '進',
    description: 'Humanity lives behind towering walls until a colossal titan breaks through. Eren Yeager vows to wipe the titans out.' },
  { id: 6, title: 'Fullmetal Alchemist, Vol. 1', author: 'Hiromu Arakawa', price: 11, genre: 'Adventure', rating: 4.9, colors: ['#7a1f1f', '#d9a441'], glyph: '鋼',
    description: 'After a forbidden ritual costs them dearly, brothers Edward and Alphonse Elric search for the Philosopher\'s Stone.' },
  { id: 7, title: 'Death Note, Vol. 1', author: 'Tsugumi Ohba & Takeshi Obata', price: 10, genre: 'Thriller', rating: 4.7, colors: ['#111111', '#5a0f1a'], glyph: '死',
    description: 'A student finds a notebook that kills anyone whose name is written in it, and the detective L sets out to stop him.' },
  { id: 8, title: 'My Hero Academia, Vol. 1', author: 'Kohei Horikoshi', price: 10, genre: 'Action', rating: 4.6, colors: ['#0f6b4a', '#f2c230'], glyph: '英',
    description: 'In a world where nearly everyone has a superpower, Izuku Midoriya is born without one, until he meets the greatest hero.' },
  { id: 9, title: 'Chainsaw Man, Vol. 1', author: 'Tatsuki Fujimoto', price: 10, genre: 'Horror', rating: 4.8, trending: true, colors: ['#b3261e', '#2a0d0d'], glyph: '電',
    description: 'Debt-ridden Denji merges with his chainsaw devil pet and joins a government team of devil hunters.' },
  { id: 10, title: 'Spy x Family, Vol. 1', author: 'Tatsuya Endo', price: 10, genre: 'Comedy', rating: 4.8, colors: ['#1f7a6d', '#f4b5c4'], glyph: '家',
    description: 'A spy, an assassin and a telepathic child pose as a family for a secret mission, each hiding the truth from the others.' },
  { id: 11, title: 'Berserk Deluxe, Vol. 1', author: 'Kentaro Miura', price: 30, genre: 'Dark Fantasy', rating: 4.9, colors: ['#0b0b0e', '#4a4f5c'], glyph: '狂',
    description: 'The lone mercenary Guts swings an enormous sword through a brutal medieval world of demons and betrayal.' },
  { id: 12, title: 'Vagabond, Vol. 1', author: 'Takehiko Inoue', price: 20, genre: 'Historical', rating: 4.9, colors: ['#5c4a32', '#d8c9a3'], glyph: '剣',
    description: 'A fictionalised retelling of Miyamoto Musashi\'s path from a wild youth to Japan\'s most famous swordsman.' },
  { id: 13, title: 'Your Name (Novel)', author: 'Makoto Shinkai', price: 14, genre: 'Romance', rating: 4.6, colors: ['#2b3a8c', '#ff7eb6'], glyph: '君',
    description: 'Two teenagers who swap bodies in their sleep try to find each other across distance and time.' },
  { id: 14, title: 'Vinland Saga, Book 1', author: 'Makoto Yukimura', price: 25, genre: 'Historical', rating: 4.8, colors: ['#1c3b57', '#9fb8c9'], glyph: '海',
    description: 'A Viking-age epic that follows Thorfinn\'s quest for revenge, and what he becomes after it.' },
  { id: 15, title: 'Frieren: Beyond Journey\'s End, Vol. 1', author: 'Kanehito Yamada & Tsukasa Abe', price: 11, genre: 'Fantasy', rating: 4.9, trending: true, colors: ['#5b6cff', '#c7d2ff'], glyph: '旅',
    description: 'After the hero party defeats the Demon King, the elf mage Frieren sets out to understand the humans she outlived.' },
  { id: 16, title: 'Blue Lock, Vol. 1', author: 'Muneyuki Kaneshiro', price: 11, genre: 'Sports', rating: 4.5, colors: ['#0a2a6b', '#2fb4ff'], glyph: '蹴',
    description: 'Japan locks 300 strikers in a program built to create the world\'s most ruthless forward.' },
  { id: 17, title: 'Dandadan, Vol. 1', author: 'Yukinobu Tatsu', price: 12, genre: 'Supernatural', rating: 4.7, colors: ['#6a1b9a', '#ff9f1c'], glyph: '妖',
    description: 'A girl who believes in ghosts and a boy who believes in aliens both turn out to be right.' },
  { id: 18, title: 'Dragon Ball, Vol. 1', author: 'Akira Toriyama', price: 10, genre: 'Adventure', rating: 4.8, colors: ['#e8590c', '#ffd43b'], glyph: '龍',
    description: 'Young Goku and Bulma hunt for the seven Dragon Balls in the story that shaped modern shonen.' },
]

export const genres = [...new Set(books.map((b) => b.genre))].sort()

// Transform API book data to match the existing format
export function transformBook(apiBook) {
  return {
    id: apiBook._id || apiBook.id,
    _id: apiBook._id,
    title: apiBook.title,
    author: apiBook.author,
    description: apiBook.description,
    price: apiBook.price,
    originalPrice: apiBook.originalPrice,
    genre: apiBook.category?.name || apiBook.category?.slug || apiBook.genre,
    rating: apiBook.rating,
    trending: apiBook.featured,
    image: apiBook.coverImage,
    colors: apiBook.colors || ['#3b2a20', '#8a3b2b'],
    glyph: apiBook.glyph || '书',
    stock: apiBook.stock,
    isActive: apiBook.isActive,
    category: apiBook.category,
    isbn: apiBook.isbn,
    publisher: apiBook.publisher,
    publishedYear: apiBook.publishedYear,
    language: apiBook.language,
    discountPercent: apiBook.discountPercent,
  };
}

export function transformBooks(apiBooks) {
  return apiBooks.map(transformBook);
}

// Compare as strings so URL route params (always strings) match numeric ids too.
export const getBookById = (id, booksArray = books) =>
  booksArray.find((b) => String(b.id) === String(id) || String(b._id) === String(id))

export const relatedBooks = (book, allBooks = books, n = 4) =>
  allBooks.filter((b) => (b.id !== book.id && b._id !== book._id) && b.genre === book.genre).concat(
    allBooks.filter((b) => (b.id !== book.id && b._id !== book._id) && b.genre !== book.genre)
  ).slice(0, n)