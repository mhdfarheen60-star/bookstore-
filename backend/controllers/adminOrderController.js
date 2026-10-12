import Order from '../models/Order.js';
import { AppError } from '../middleware/errorMiddleware.js';
import escapeRegex from '../utils/escapeRegex.js';

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, sort = 'createdAt', order = 'desc' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      const pattern = escapeRegex(search);
      query.$or = [
        { orderNumber: { $regex: pattern, $options: 'i' } },
        { 'shippingAddress.name': { $regex: pattern, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    const allowedSorts = ['createdAt', 'total', 'status'];
    const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort(sortOptions)
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
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
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

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return next(new AppError('Invalid order status', 400));
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return next(new AppError('Invalid payment status', 400));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      }
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order: updatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

export { getAllOrders, getOrderById, updateOrderStatus };