// Centralized API client for LocalConnect

const API_BASE = '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: any;
}

class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('localconnect_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // sends cookies
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(json.message || `Request failed with status ${response.status}`, response.status, json);
  }

  return json as T;
}

export const api = {
  // Auth
  register: (body: any) => request<ApiResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<ApiResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<ApiResponse>('/auth/logout', { method: 'POST' }),
  getMe: () => request<ApiResponse>('/auth/me'),
  forgotPassword: (email: string) => request<ApiResponse>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body: any) => request<ApiResponse>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Categories
  getCategories: () => request<ApiResponse>('/categories'),
  getCategory: (slug: string) => request<ApiResponse>(`/categories/${slug}`),

  // Services
  getServices: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<ApiResponse>(`/services${qs ? `?${qs}` : ''}`);
  },
  getFeaturedServices: () => request<ApiResponse>('/services/featured'),
  getService: (id: string) => request<ApiResponse>(`/services/${id}`),
  createProviderService: (body: any) => request<ApiResponse>('/services/provider/services', { method: 'POST', body: JSON.stringify(body) }),
  updateProviderService: (id: string, body: any) => request<ApiResponse>(`/services/provider/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProviderService: (id: string) => request<ApiResponse>(`/services/provider/services/${id}`, { method: 'DELETE' }),

  // Providers
  getProviders: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<ApiResponse>(`/providers${qs ? `?${qs}` : ''}`);
  },
  getProvider: (id: string) => request<ApiResponse>(`/providers/${id}`),
  getProviderProfile: () => request<ApiResponse>('/providers/account/profile'),
  updateProviderProfile: (body: any) => request<ApiResponse>('/providers/account/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  submitVerification: (body: any) => request<ApiResponse>('/providers/verification', { method: 'POST', body: JSON.stringify(body) }),
  getVerificationStatus: () => request<ApiResponse>('/providers/verification/status'),
  updateAvailability: (body: any) => request<ApiResponse>('/providers/availability', { method: 'PATCH', body: JSON.stringify(body) }),
  getProviderDashboard: () => request<ApiResponse>('/providers/dashboard/stats'),

  // Bookings
  createBooking: (body: any) => request<ApiResponse>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request<ApiResponse>('/bookings/my'),
  getProviderBookings: (status?: string) => request<ApiResponse>(`/bookings/provider${status ? `?status=${status}` : ''}`),
  getBooking: (id: string) => request<ApiResponse>(`/bookings/${id}`),
  cancelBooking: (id: string, reason?: string) => request<ApiResponse>(`/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ cancellationReason: reason }) }),
  acceptBooking: (id: string) => request<ApiResponse>(`/bookings/provider/${id}/accept`, { method: 'PATCH' }),
  rejectBooking: (id: string, reason?: string) => request<ApiResponse>(`/bookings/provider/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  updateBookingStatus: (id: string, newStatus: string, note?: string) => request<ApiResponse>(`/bookings/provider/${id}/status`, { method: 'PATCH', body: JSON.stringify({ newStatus, note }) }),

  // Reviews
  createReview: (body: any) => request<ApiResponse>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  getProviderReviews: (providerId: string) => request<ApiResponse>(`/reviews/provider/${providerId}`),
  updateReview: (id: string, body: any) => request<ApiResponse>(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteReview: (id: string) => request<ApiResponse>(`/reviews/${id}`, { method: 'DELETE' }),

  // Customer
  getCustomerProfile: () => request<ApiResponse>('/customer/profile'),
  updateCustomerProfile: (body: any) => request<ApiResponse>('/customer/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  getAddresses: () => request<ApiResponse>('/customer/addresses'),
  createAddress: (body: any) => request<ApiResponse>('/customer/addresses', { method: 'POST', body: JSON.stringify(body) }),
  updateAddress: (id: string, body: any) => request<ApiResponse>(`/customer/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAddress: (id: string) => request<ApiResponse>(`/customer/addresses/${id}`, { method: 'DELETE' }),
  getCustomerDashboard: () => request<ApiResponse>('/customer/dashboard/stats'),

  // Notifications
  getNotifications: () => request<ApiResponse>('/notifications'),
  markNotificationRead: (id: string) => request<ApiResponse>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<ApiResponse>('/notifications/read-all', { method: 'PATCH' }),

  // Contact
  submitContact: (body: any) => request<ApiResponse>('/contact', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminDashboard: () => request<ApiResponse>('/admin/dashboard'),
  getAdminUsers: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<ApiResponse>(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  updateUserStatus: (id: string, status: string) => request<ApiResponse>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminVerifications: (status?: string) => request<ApiResponse>(`/admin/verifications${status ? `?status=${status}` : ''}`),
  reviewVerification: (id: string, decision: string, feedback?: string) => request<ApiResponse>(`/admin/verifications/${id}`, { method: 'PATCH', body: JSON.stringify({ decision, feedback }) }),
  getAdminBookings: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<ApiResponse>(`/admin/bookings${qs ? `?${qs}` : ''}`);
  },
  getAdminReviews: () => request<ApiResponse>('/admin/reviews'),
  moderateReview: (id: string, moderationStatus: string) => request<ApiResponse>(`/admin/reviews/${id}/moderation`, { method: 'PATCH', body: JSON.stringify({ moderationStatus }) }),
  getAdminCategories: () => request<ApiResponse>('/admin/categories'),
  createCategory: (body: any) => request<ApiResponse>('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: string, body: any) => request<ApiResponse>(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminAuditLogs: () => request<ApiResponse>('/admin/audit-logs'),

  // Demonstration seed
  seedDatabase: (force = false) => request<ApiResponse>('/seed', { method: 'POST', body: JSON.stringify({ force }) }),
};
