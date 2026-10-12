import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/useAuth'
import { api } from '../../api/client'
import { formatPrice } from '../../utils/format'

const TABS = [
  { id: 'sell', label: 'Sell Book' },
  { id: 'status', label: 'Book Status' },
  { id: 'history', label: 'Purchase History' },
]

const FIELDS = [
  { name: 'title', label: 'Title', placeholder: 'Enter book title', required: true },
  { name: 'publisher', label: 'Publisher', placeholder: 'Enter publisher' },
  { name: 'author', label: 'Author', placeholder: 'Enter author', required: true },
  { name: 'language', label: 'Language', placeholder: 'Enter language' },
  { name: 'pages', label: 'No. of Pages', type: 'number', placeholder: 'Enter number of pages' },
  { name: 'isbn', label: 'ISBN', placeholder: 'Enter ISBN' },
  { name: 'category', label: 'Category', placeholder: 'Enter category' },
  { name: 'price', label: 'Price', type: 'number', placeholder: 'Enter price', required: true },
  { name: 'discountPrice', label: 'Discount Price', type: 'number', placeholder: 'Enter discount price' },
  { name: 'imageUrl', label: 'Image URL', placeholder: 'Paste image URL' },
]

const EMPTY_FORM = Object.fromEntries([...FIELDS.map((f) => [f.name, '']), ['abstract', '']])

const INITIAL_LISTINGS = [
  {
    id: 'l1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    price: 499,
    abstract:
      'A novel about all the choices that go into a life well lived. It follows a woman who finds herself in a mysterious library between life and death, where each book represents a different path her life could have taken.',
    image: 'https://images-na.ssl-images-amazon.com/images/I/81J6w6Y5fVL.jpg',
  },
  {
    id: 'l2',
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 599,
    abstract:
      'A practical guide about building good habits and breaking bad ones through small, consistent changes.',
    image: 'https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg',
  },
]

const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const inputClass = 'w-full rounded border border-gray-300 p-3 outline-none focus:border-blue-900'

function BookRow({ book, children, footer }) {
  return (
    <article className="flex min-h-[280px] flex-col justify-between gap-8 rounded-md bg-gray-100 p-6 shadow-sm md:flex-row md:p-8">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-800">{book.title}</h2>
        <p className="mt-2 text-lg text-gray-800">{book.author}</p>
        <p className="mt-2 text-lg font-semibold text-blue-600">{rupees(book.price)}</p>
        {book.abstract && <p className="mt-3 leading-7 text-gray-700">{book.abstract}</p>}
        {footer}
      </div>
      <div className="flex flex-col items-center justify-center md:w-55">
        {book.image ? (
          <img src={book.image} alt={book.title} loading="lazy" decoding="async" className="h-55 w-47.5 rounded object-cover" />
        ) : (
          <div className="flex h-55 w-47.5 items-center justify-center rounded bg-gray-200 text-sm text-gray-500">No image</div>
        )}
        {children}
      </div>
    </article>
  )
}

function SellForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [picked, setPicked] = useState(null)
  const keepUrl = useRef('')

  useEffect(
    () => () => {
      if (picked && picked.url !== keepUrl.current) URL.revokeObjectURL(picked.url)
    },
    [picked],
  )

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    setPicked(file ? { name: file.name, url: URL.createObjectURL(file) } : null)
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    keepUrl.current = picked?.url ?? ''
    onSubmit({ ...form, image: picked?.url || form.imageUrl })
    setForm(EMPTY_FORM)
    setPicked(null)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-md md:p-10">
      <h2 className="mb-10 text-center text-3xl font-bold text-blue-900">Book Details</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {FIELDS.map(({ name, label, ...rest }) => (
          <div key={name}>
            <label htmlFor={name} className="mb-2 block font-semibold text-gray-700">{label}</label>
            <input id={name} name={name} value={form[name]} onChange={handleChange}
              type={rest.type ?? 'text'} min={rest.type === 'number' ? 0 : undefined}
              placeholder={rest.placeholder} required={rest.required} className={inputClass} />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label htmlFor="abstract" className="mb-2 block font-semibold text-gray-700">Abstract</label>
        <textarea id="abstract" name="abstract" rows="5" value={form.abstract} onChange={handleChange}
          placeholder="Enter book abstract" className={`${inputClass} resize-none`} />
      </div>

      <div className="mt-8">
        <span className="mb-3 block font-semibold text-gray-700">Upload Book Image</span>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-8">
          {picked ? (
            <img src={picked.url} alt="Selected book cover" className="mb-4 h-40 rounded object-cover" />
          ) : (
            <div className="mb-3 text-5xl text-blue-700" aria-hidden="true">↑</div>
          )}
          <p className="mb-4 text-gray-600">{picked ? picked.name : 'Click here to upload your book image'}</p>
          <label className="cursor-pointer bg-blue-900 px-6 py-2 text-white hover:bg-blue-800">
            Choose Image
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button type="submit" className="bg-blue-900 px-12 py-3 text-lg font-semibold text-white hover:bg-blue-800">
          Submit
        </button>
      </div>
    </form>
  )
}

function OrderRow({ order }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-gray-800">Order #{order.orderNumber?.slice(-8) || order._id.slice(-8)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatPrice(order.total)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Details
          </button>
          {order.status === 'pending' || order.status === 'confirmed' ? (
            <button className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700">
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [tab, setTab] = useState('sell')
  const [listings, setListings] = useState(INITIAL_LISTINGS)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [messages, setMessages] = useState({ success: '', error: '' })

  const addListing = (values) => {
    setListings((prev) => [{ ...values, id: crypto.randomUUID() }, ...prev])
    setTab('status')
  }
  const removeListing = (id) => setListings((prev) => prev.filter((b) => b.id !== id))

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.getMyOrders();
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Seed the editable form once the user is known. Guarded on the id so a
  // later unrelated re-render does not overwrite what the user is typing.
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || { street: '', city: '', state: '', zipCode: '', country: '' },
    });
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessages({ success: '', error: '' });
    try {
      const response = await updateProfile(profileForm);
      if (response.success) {
        setMessages({ success: 'Profile updated successfully', error: '' });
        setEditMode(false);
      } else {
        setMessages({ success: '', error: response.message });
      }
    } catch (error) {
      setMessages({ success: '', error: error.message });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessages({ success: '', error: '' });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessages({ success: '', error: 'Passwords do not match' });
      return;
    }
    try {
      const response = await changePassword(passwordForm);
      if (response.success) {
        setMessages({ success: 'Password changed successfully', error: '' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessages({ success: '', error: response.message });
      }
    } catch (error) {
      setMessages({ success: '', error: error.message });
    }
  };

  return (
    <>
      {/* Cover + avatar */}
      <div className="h-50 w-full bg-blue-950" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="-mt-20 flex h-40 w-40 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-6xl text-gray-400 sm:h-48 sm:w-48">
          <FontAwesomeIcon icon={faUser} />
        </div>

        <div className="my-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{user?.name || 'User Name'}</h1>
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className="rounded bg-blue-900 px-5 py-2 text-white hover:bg-blue-800"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {messages.success && (
          <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-800">{messages.success}</div>
        )}
        {messages.error && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">{messages.error}</div>
        )}

        <p className="mt-5 leading-7 text-gray-600">
          {user?.email}
        </p>

        {/* Tabs */}
        <div role="tablist" className="my-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0">
          {TABS.map(({ id, label }) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`w-55 border border-blue-900 py-4 font-semibold transition-colors sm:w-50 ${
                tab === id ? 'bg-blue-900 text-white' : 'bg-white text-blue-900 hover:bg-blue-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mx-auto mb-12 max-w-262.5 space-y-6 px-4">
          {tab === 'sell' && <SellForm onSubmit={addListing} />}

          {tab === 'status' &&
            (listings.length ? (
              listings.map((book) => (
                <BookRow key={book.id} book={book}>
                  <button type="button" onClick={() => removeListing(book.id)}
                    className="mt-4 bg-red-600 px-7 py-2 text-white hover:bg-red-700">
                    Delete
                  </button>
                </BookRow>
              ))
            ) : (
              <p className="text-center text-gray-600">You haven't listed any books yet.</p>
            ))}

          {tab === 'history' && (
            <>
              {editMode && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-xl font-bold text-gray-800">Edit Profile</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block font-semibold text-gray-700">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-semibold text-gray-700">Phone</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="mb-4 font-semibold text-gray-700">Shipping Address</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block font-semibold text-gray-700">Street</label>
                          <input
                            type="text"
                            value={profileForm.address.street}
                            onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-semibold text-gray-700">City</label>
                          <input
                            type="text"
                            value={profileForm.address.city}
                            onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, city: e.target.value } })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-semibold text-gray-700">State</label>
                          <input
                            type="text"
                            value={profileForm.address.state}
                            onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, state: e.target.value } })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-semibold text-gray-700">ZIP Code</label>
                          <input
                            type="text"
                            value={profileForm.address.zipCode}
                            onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, zipCode: e.target.value } })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-semibold text-gray-700">Country</label>
                          <input
                            type="text"
                            value={profileForm.address.country}
                            onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, country: e.target.value } })}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button type="button" onClick={() => setEditMode(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-6 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800">Save Changes</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                <h2 className="mb-6 text-xl font-bold text-gray-800">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block font-semibold text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-semibold text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className={inputClass}
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-semibold text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800">Update Password</button>
                  </div>
                </form>
              </div>
              <div className="mt-6">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Order History</h2>
                {loadingOrders ? (
                  <div className="text-center py-8 text-gray-500">Loading orders...</div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderRow key={order._id} order={order} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">You haven't placed any orders yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile