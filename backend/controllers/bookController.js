import Book from '../models/Book.js';
import Category from '../models/Category.js';
import { AppError } from '../middleware/errorMiddleware.js';

const getAllBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      featured,
      includeInactive,
    } = req.query;

    const query = {};

    // Shoppers only ever see live books. An authenticated admin may ask for the
    // full catalogue so they can manage deactivated titles too.
    if (includeInactive === 'true') {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Admin access required to include inactive books', 403));
      }
    } else {
      query.isActive = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      const cat = await Category.findOne({
        $or: [{ _id: category }, { slug: category }],
        isActive: true,
      });
      if (cat) {
        query.category = cat._id;
      } else {
        query.category = null;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const sortOptions = {};
    const allowedSorts = ['price', 'rating', 'createdAt', 'title'];
    const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Book.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalBooks: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate('category', 'name slug description image');

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    const relatedBooks = await Book.find({
      _id: { $ne: book._id },
      category: book.category,
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(4)
      .lean();

    res.json({
      success: true,
      data: {
        book,
        relatedBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedBooks = async (req, res, next) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 8));
    const books = await Book.find({ featured: true, isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

const searchBooks = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { books: [] } });
    }

    const books = await Book.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .limit(Math.min(20, Math.max(1, parseInt(limit))))
      .lean();

    res.json({
      success: true,
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      description,
      price,
      originalPrice,
      coverImage,
      category,
      isbn,
      publisher,
      publishedYear,
      stock,
      language,
      featured,
      colors,
      glyph,
    } = req.body;

    const cat = await Category.findById(category);
    if (!cat) {
      return next(new AppError('Category not found', 404));
    }

    if (!cat.isActive) {
      return next(new AppError('Cannot add book to inactive category', 400));
    }

    const book = await Book.create({
      title,
      author,
      description,
      price,
      originalPrice,
      coverImage,
      category,
      isbn,
      publisher,
      publishedYear,
      stock,
      language,
      featured: featured || false,
      colors: colors || ['#3b2a20', '#8a3b2b'],
      glyph: glyph || '书',
    });

    await book.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      description,
      price,
      originalPrice,
      coverImage,
      category,
      isbn,
      publisher,
      publishedYear,
      stock,
      language,
      featured,
      isActive,
      colors,
      glyph,
    } = req.body;

    const bookId = req.params.id;

    // First, get the current book to check its existing ISBN
    const currentBook = await Book.findById(bookId);
    if (!currentBook) {
      return next(new AppError('Book not found', 404));
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (publisher !== undefined) updateData.publisher = publisher;
    if (publishedYear !== undefined) updateData.publishedYear = publishedYear;
    if (stock !== undefined) updateData.stock = stock;
    if (language !== undefined) updateData.language = language;
    if (featured !== undefined) updateData.featured = featured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (colors !== undefined) updateData.colors = colors;
    if (glyph !== undefined) updateData.glyph = glyph;

    if (category) {
      const cat = await Category.findById(category);
      if (!cat) {
        return next(new AppError('Category not found', 404));
      }
      if (!cat.isActive) {
        return next(new AppError('Cannot assign book to inactive category', 400));
      }
    }

    // Check for ISBN duplicate if ISBN is being updated and it's different from current
    if (isbn !== undefined && isbn !== currentBook.isbn) {
      const existingBook = await Book.findOne({ isbn, _id: { $ne: bookId } });
      if (existingBook) {
        return next(new AppError('This ISBN is already assigned to another book.', 409));
      }
    }

    const book = await Book.findByIdAndUpdate(bookId, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book },
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (E11000) for ISBN
    if (error.code === 11000 && error.keyValue && error.keyValue.isbn) {
      return next(new AppError('This ISBN is already assigned to another book.', 409));
    }
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const updateBookStock = async (req, res, next) => {
  try {
    const { stock, operation } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return next(new AppError('Valid stock number is required', 400));
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    let newStock;
    if (operation === 'increment') {
      newStock = book.stock + stock;
    } else if (operation === 'decrement') {
      newStock = Math.max(0, book.stock - stock);
    } else {
      newStock = stock;
    }

    book.stock = newStock;
    await book.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { stock: book.stock },
    });
  } catch (error) {
    next(error);
  }
};

const getBooksByCategory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;

    const category = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    });

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const sortOptions = {};
    const allowedSorts = ['price', 'rating', 'createdAt', 'title'];
    const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find({ category: category._id, isActive: true })
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Book.countDocuments({ category: category._id, isActive: true }),
    ]);

    res.json({
      success: true,
      data: {
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
        },
        books,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalBooks: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllBooks,
  getBookById,
  getFeaturedBooks,
  searchBooks,
  createBook,
  updateBook,
  deleteBook,
  updateBookStock,
  getBooksByCategory,
};