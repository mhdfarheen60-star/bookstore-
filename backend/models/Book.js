import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      validate: {
        validator: function (value) {
          return !value || value >= this.price;
        },
        message: 'Original price must be greater than or equal to price',
      },
    },
    coverImage: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: [/^[0-9Xx\-]{10,17}$/, 'Please provide a valid ISBN'],
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, 'Publisher name cannot exceed 100 characters'],
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Invalid year'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    colors: {
      type: [String],
      default: ['#3b2a20', '#8a3b2b'],
    },
    glyph: {
      type: String,
      default: '书',
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ featured: 1, isActive: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ isActive: 1, stock: 1 });

bookSchema.virtual('discountPercent').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

const Book = mongoose.model('Book', bookSchema);
export default Book;