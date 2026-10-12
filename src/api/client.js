const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Marks that the stored token is no longer usable. Wired by AuthContext so a
  // rejected token can also clear React state, not just this client.
  onUnauthorized = null;

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      // Send the httpOnly auth cookie alongside the Bearer token so the
      // cookie-based session the API sets is actually usable cross-origin.
      credentials: 'include',
      ...options,
      headers,
    };

    // A failed parse must not be reported as a network error.
    const parse = async (response) => {
      try {
        return await response.json();
      } catch {
        return {};
      }
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch {
      // fetch only rejects for network-level failures.
      throw new Error('Network error. Please check your connection.');
    }

    const data = await parse(response);

    if (response.status === 401) {
      // Distinguish a genuinely dead token from a rejected credential. Only the
      // former should sign the user out; the latter must keep the server's
      // message ("Invalid email or password") instead of a generic one.
      const authEndpoints = ['/auth/login', '/auth/register'];
      const isCredentialRejection = authEndpoints.includes(endpoint);

      if (!isCredentialRejection) {
        this.clearToken();
        this.onUnauthorized?.();
      }

      throw new Error(data.message || 'Authentication required');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Book endpoints
  async getBooks(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    return this.request(`/books?${searchParams.toString()}`);
  }

  async getFeaturedBooks(limit = 8) {
    return this.request(`/books/featured?limit=${limit}`);
  }

  async getBookById(id) {
    return this.request(`/books/${id}`);
  }

  // Category endpoints
  async getCategories() {
    return this.request('/categories');
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(bookId, quantity = 1) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity }),
    });
  }

  async updateCartItem(bookId, quantity) {
    return this.request(`/cart/items/${bookId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(bookId) {
    return this.request(`/cart/items/${bookId}`, { method: 'DELETE' });
  }

  async clearCart() {
    return this.request('/cart', { method: 'DELETE' });
  }

  // Order endpoints
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/orders/my-orders?${searchParams.toString()}`);
  }

  // Admin: dashboard
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  // Admin: books
  async createBook(data) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBook(id, data) {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBook(id) {
    return this.request(`/books/${id}`, { method: 'DELETE' });
  }

  // Admin: categories
  async createCategory(data) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id, data) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Admin: users
  async getAllUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/users?${searchParams.toString()}`);
  }

  async updateUser(id, data) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  // Admin: orders
  async getAllOrders(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/orders?${searchParams.toString()}`);
  }

  async getAdminOrderById(id) {
    return this.request(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id, data) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();