import { Router } from 'express';
import { body, param } from 'express-validator';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);

router.post(
  '/items',
  [
    body('bookId').isMongoId().withMessage('Valid book ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  addToCart
);

router.put(
  '/items/:bookId',
  [
    param('bookId').isMongoId().withMessage('Invalid book ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  updateCartItem
);

router.delete('/items/:bookId', [param('bookId').isMongoId().withMessage('Invalid book ID')], validate, removeFromCart);

router.delete('/', clearCart);

export default router;