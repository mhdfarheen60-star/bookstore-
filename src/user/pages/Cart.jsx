import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faMinus, faPlus, faArrowLeft, faCreditCard, faCheckCircle, faShoppingCart, faXmark, faUser } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../../context/useCart'
import { useAuth } from '../../context/useAuth'
import { api } from '../../api/client'
import BookCover from '../components/BookCover'
import { formatPrice } from '../../utils/format'

function CartPage() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, refreshCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  })
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    }
  }, [isAuthenticated, refreshCart]);

  const handleQuantityChange = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(bookId, newQuantity);
  };

  const handleRemove = async (bookId) => {
    await removeFromCart(bookId);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    const requiredFields = ['name', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    for (const field of requiredFields) {
      if (!shippingForm[field]) {
        setCheckoutError(`${field} is required`);
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      const response = await api.createOrder({
        shippingAddress: shippingForm,
        paymentMethod: 'cod',
      });
      if (response.success) {
        setShowCheckout(false);
        navigate(`/profile?tab=history`);
      } else {
        setCheckoutError(response.message || 'Failed to create order');
      }
    } catch (error) {
      setCheckoutError(error.message || 'Network error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = cart.subtotal || 0;
  const shippingFee = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shippingFee + tax;

  if (!isAuthenticated) {
    return (
      <div className="bg-ink text-moon min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-sakura mb-4" />
          <h1 className="font-serif text-3xl font-extrabold mb-2">Please log in to view your cart</h1>
          <p className="text-moon/60 mb-6">You need to be logged in to manage your shopping cart.</p>
          <Link to="/login" className="inline-block rounded-full bg-sakura px-8 py-3 font-semibold text-white hover:bg-sakura/85">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink text-moon min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl font-extrabold">Shopping Cart</h1>
          <Link to="/all-books" className="text-sakura hover:underline flex items-center gap-1">
            <FontAwesomeIcon icon={faArrowLeft} size={14} />
            Continue Shopping
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-moon/30 mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-moon/60 mb-6">Looks like you haven't added any books yet.</p>
            <Link to="/all-books" className="inline-block rounded-full bg-sakura px-8 py-3 font-semibold text-white hover:bg-sakura/85">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <article key={item.book._id || item.book.id} className="flex gap-4 rounded-lg border border-white/10 bg-panel p-4">
                  <div className="flex-shrink-0 w-24 h-36 overflow-hidden rounded-md">
                    <BookCover book={item.book} eager />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-moon line-clamp-1">{item.book.title}</h3>
                    <p className="mt-1 text-sm text-moon/60">{item.book.author}</p>
                    <p className="mt-2 font-semibold text-sakura">{formatPrice(item.priceAtAdd)}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded border border-white/20">
                        <button
                          onClick={() => handleQuantityChange(item.book._id || item.book.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || loading}
                          className="px-3 py-1 text-moon hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FontAwesomeIcon icon={faMinus} size={12} />
                        </button>
                        <span className="px-3 text-moon">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.book._id || item.book.id, item.quantity + 1)}
                          disabled={loading}
                          className="px-3 py-1 text-moon hover:bg-white/10"
                        >
                          <FontAwesomeIcon icon={faPlus} size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.book._id || item.book.id)}
                        disabled={loading}
                        className="ml-auto text-moon/50 hover:text-red-400"
                        aria-label="Remove from cart"
                      >
                        <FontAwesomeIcon icon={faTrash} size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sakura">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="lg:sticky lg:top-24">
              <div className="rounded-xl border border-white/10 bg-panel p-6">
                <h2 className="font-serif text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-moon/80">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-moon/80">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-moon/80">
                    <span>Tax (10%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between font-semibold text-lg text-moon">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                {subtotal > 0 && subtotal < 500 && (
                  <p className="mt-4 text-xs text-moon/50">Add {formatPrice(500 - subtotal)} more for free shipping!</p>
                )}
                <button
                  onClick={() => setShowCheckout(true)}
                  disabled={checkoutLoading || cart.items.length === 0}
                  className="mt-6 w-full rounded-full bg-sakura py-3 font-semibold text-white hover:bg-sakura/85 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Processing...' : `Proceed to Checkout · ${formatPrice(total)}`}
                </button>
                <button
                  onClick={clearCart}
                  disabled={loading}
                  className="mt-3 w-full rounded-full border border-white/20 py-2 text-sm text-moon/60 hover:border-white/40 hover:text-moon"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowCheckout(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-gray-700">
                <FontAwesomeIcon icon={faXmark} size={20} />
              </button>
            </div>

            {checkoutError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">{checkoutError}</div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-sakura" />
                Shipping Information
              </h3>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sakura/50 focus:border-sakura"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sakura/50 focus:border-sakura"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={shippingForm.street}
                    onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sakura/50 focus:border-sakura"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sakura/50 focus:border-sakura"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sakura/50 focus:border-sakura"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      value={shippingForm.zipCode}
                      onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sakura/50 focus:border-sakura"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      value={shippingForm.country}
                      onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sakura/50 focus:border-sakura"
                      required
                    />
                  </div>
                </div>

                <hr className="my-4 border-gray-200" />

                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCreditCard} className="text-sakura" />
                  Payment Method
                </h3>
                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" value="cod" checked className="text-sakura" />
                    <span className="text-gray-700">Cash on Delivery (COD)</span>
                  </label>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <hr className="my-2 border-gray-300" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full rounded-full bg-sakura py-3 font-semibold text-white hover:bg-sakura/85 disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Place Order · ${formatPrice(total)}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage