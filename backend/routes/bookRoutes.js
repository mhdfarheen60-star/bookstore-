import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllBooks,
  getBookById,
  getFeaturedBooks,
  searchBooks,
  createBook,
  updateBook,
  deleteBook,
  updateBookStock,
  getBooksByCategory,
} from '../controllers/bookController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = Router();

// Public routes
// optionalAuth lets the controller know whether the caller is an admin, which is
// what gates the includeInactive flag below. Unauthenticated visitors are fine.
router.get('/', optionalAuth, getAllBooks);
router.get('/featured', getFeaturedBooks);
router.get('/search', searchBooks);
router.get('/category/:id', getBooksByCategory);
router.get('/:id', getBookById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (max 200 chars)'),
    body('author').trim().isLength({ min: 1, max: 100 }).withMessage('Author is required (max 100 chars)'),
    body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description is required (10-5000 chars)'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
    body('category').isMongoId().withMessage('Valid category ID is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('isbn').optional().isISBN().withMessage('Please provide a valid ISBN'),
    body('publisher').optional().trim().isLength({ max: 100 }).withMessage('Publisher max 100 chars'),
    body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
    body('language').optional().trim().isLength({ max: 50 }).withMessage('Language max 50 chars'),
    body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  ],
  validate,
  createBook
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid book ID'),
    body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title max 200 chars'),
    body('author').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Author max 100 chars'),
    body('description').optional().trim().isLength({ min: 10, max: 5000 }).withMessage('Description 10-5000 chars'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be positive'),
    body('category').optional().isMongoId().withMessage('Valid category ID required'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
    body('isbn').optional().isISBN().withMessage('Valid ISBN required'),
    body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  validate,
  updateBook
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isMongoId().withMessage('Invalid book ID')],
  validate,
  deleteBook
);

router.patch(
  '/:id/stock',
  authenticate,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid book ID'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('operation').optional().isIn(['set', 'increment', 'decrement']).withMessage('Invalid operation'),
  ],
  validate,
  updateBookStock
);

export default router;