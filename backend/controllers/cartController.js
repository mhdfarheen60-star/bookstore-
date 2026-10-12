import Cart from '../models/Cart.js';
import Book from '../models/Book.js';
import { AppError } from '../middleware/errorMiddleware.js';

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.book',
        select: 'title author coverImage price stock isActive',
      })
      .lean();

    if (!cart) {
      cart = { items: [], subtotal: 0, itemCount: 0 };
    }

    // Filter out inactive books and validate stock
    const validItems = cart.items.filter(
      (item) => item.book && item.book.isActive && item.book.stock > 0
    );

    const subtotal = validItems.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );
    const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cart: {
          items: validItems,
          subtotal,
          itemCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return next(new AppError('Book ID is required', 400));
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    if (!book.isActive) {
      return next(new AppError('This book is no longer available', 400));
    }

    if (book.stock < quantity) {
      return next(new AppError(`Only ${book.stock} copy(ies) available`, 400));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingItemIndex >= 0) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > book.stock) {
        return next(new AppError(`Cannot add more. Only ${book.stock} copy(ies) available`, 400));
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        book: bookId,
        quantity,
        priceAtAdd: book.price,
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate({
      path: 'items.book',
      select: 'title author coverImage price stock isActive',
    });

    const validItems = cart.items.filter(
      (item) => item.book && item.book.isActive && item.book.stock > 0
    );
    const subtotal = validItems.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );
    const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      message: 'Book added to cart',
      data: {
        cart: {
          items: validItems,
          subtotal,
          itemCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return next(new AppError('Valid quantity is required (minimum 1)', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (itemIndex === -1) {
      return next(new AppError('Book not in cart', 404));
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return next(new AppError('Book not found', 404));
    }

    if (!book.isActive) {
      return next(new AppError('This book is no longer available', 400));
    }

    if (quantity > book.stock) {
      return next(new AppError(`Only ${book.stock} copy(ies) available`, 400));
    }

    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate({
      path: 'items.book',
      select: 'title author coverImage price stock isActive',
    });

    const validItems = cart.items.filter(
      (item) => item.book && item.book.isActive && item.book.stock > 0
    );
    const subtotal = validItems.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );
    const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        cart: {
          items: validItems,
          subtotal,
          itemCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);
    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate({
      path: 'items.book',
      select: 'title author coverImage price stock isActive',
    });

    const validItems = cart.items.filter(
      (item) => item.book && item.book.isActive && item.book.stock > 0
    );
    const subtotal = validItems.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );
    const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: {
          items: validItems,
          subtotal,
          itemCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.json({
        success: true,
        message: 'Cart is already empty',
        data: { cart: { items: [], subtotal: 0, itemCount: 0 } },
      });
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: { cart: { items: [], subtotal: 0, itemCount: 0 } },
    });
  } catch (error) {
    next(error);
  }
};

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };