import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Book from '../models/Book.js';
import { AppError } from '../middleware/errorMiddleware.js';

// Transactions need a replica set (or Atlas). A standalone mongod cannot run
// them, so detect the topology at runtime and fall back to sequential writes.
const supportsTransactions = () => {
  const conn = Order.db;
  const topology = conn?.client?.topology;
  const type = topology?.description?.type;
  if (type) return type !== 'Single' && type !== 'Standalone';
  // Topology not established yet – assume standalone, which is the safe default.
  return false;
};

const createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      paymentMethod = 'cod',
      notes,
    } = req.body;

    if (!shippingAddress) {
      return next(new AppError('Shipping address is required', 400));
    }

    const requiredFields = ['name', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return next(new AppError(`${field} is required in shipping address`, 400));
      }
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.book',
        select: 'title author coverImage price stock isActive',
      });

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    const validItems = cart.items.filter(
      (item) => item.book && item.book.isActive && item.book.stock > 0
    );

    if (validItems.length === 0) {
      return next(new AppError('No valid items in cart', 400));
    }

    // Validate stock for all items
    for (const item of validItems) {
      if (item.quantity > item.book.stock) {
        return next(
          new AppError(
            `Insufficient stock for "${item.book.title}". Available: ${item.book.stock}`,
            400
          )
        );
      }
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );
    const shippingFee = subtotal > 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shippingFee + tax;

    const useTransactions = supportsTransactions();

    if (useTransactions) {
      const session = await Order.startSession();
      session.startTransaction();

      try {
        const orderItems = validItems.map((item) => ({
          book: item.book._id,
          title: item.book.title,
          author: item.book.author,
          coverImage: item.book.coverImage,
          price: item.priceAtAdd,
          quantity: item.quantity,
        }));

        const order = await Order.create(
          [
            {
              user: req.user._id,
              items: orderItems,
              shippingAddress,
              subtotal,
              shippingFee,
              tax,
              total,
              status: 'pending',
              // COD is collected on delivery, so payment stays pending for now.
              paymentStatus: 'pending',
              paymentMethod,
              notes,
            },
          ],
          { session }
        );

        for (const item of validItems) {
          // Guarded $inc so concurrent checkouts can never drive stock negative.
          await Book.findOneAndUpdate(
            { _id: item.book._id, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session }
          );
        }

        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();

        const createdOrder = await Order.findById(order[0]._id)
          .populate('user', 'name email')
          .lean();

        return res.status(201).json({
          success: true,
          message: 'Order created successfully',
          data: { order: createdOrder },
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    } else {
      // Fallback without transactions for standalone MongoDB
      const orderItems = validItems.map((item) => ({
        book: item.book._id,
        title: item.book.title,
        author: item.book.author,
        coverImage: item.book.coverImage,
        price: item.priceAtAdd,
        quantity: item.quantity,
      }));

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        subtotal,
        shippingFee,
        tax,
        total,
        status: 'pending',
        // COD is collected on delivery, so payment stays pending for now.
        paymentStatus: 'pending',
        paymentMethod,
        notes,
      });

      // Decrease stock
      for (const item of validItems) {
        // Guarded $inc so concurrent checkouts can never drive stock negative.
        await Book.findOneAndUpdate(
          { _id: item.book._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
      }

      // Clear cart
      cart.items = [];
      await cart.save();

      const createdOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .lean();

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order: createdOrder },
      });
    }
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalOrders: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return next(
        new AppError(`Cannot cancel order with status: ${order.status}`, 400)
      );
    }

    const useTransactions = supportsTransactions();

    if (useTransactions) {
      const session = await Order.startSession();
      session.startTransaction();

      try {
        for (const item of order.items) {
          await Book.findByIdAndUpdate(
            item.book,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelledBy = req.user._id;
        await order.save({ session });

        await session.commitTransaction();

        const updatedOrder = await Order.findById(order._id).lean();

        return res.json({
          success: true,
          message: 'Order cancelled successfully',
          data: { order: updatedOrder },
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    } else {
      // Fallback without transactions
      for (const item of order.items) {
        await Book.findByIdAndUpdate(
          item.book,
          { $inc: { stock: item.quantity } }
        );
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancelledBy = req.user._id;
      await order.save();

      const updatedOrder = await Order.findById(order._id).lean();

      return res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order: updatedOrder },
      });
    }
  } catch (error) {
    next(error);
  }
};

export { createOrder, getMyOrders, getOrderById, cancelOrder };