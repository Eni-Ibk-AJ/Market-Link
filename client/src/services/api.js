import axios from 'axios';

export const TOKEN_KEY = 'marketlinkToken';
export const USER_KEY = 'marketlinkUser';
const configuredBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001')
	.trim()
	.replace(/\/+$/, '');

const apiClient = axios.create({
	baseURL: configuredBaseUrl.endsWith('/api') ? configuredBaseUrl : `${configuredBaseUrl}/api`,
	headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem(TOKEN_KEY);
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
	error.response?.data?.message || error.message || fallback;

export function saveSession({ token, user }) {
	if (token) localStorage.setItem(TOKEN_KEY, token);
	if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}

export const api = {
	auth: {
		login: (payload) => apiClient.post('/login', payload),
		register: (payload) => apiClient.post('/register', payload),
	},
	products: {
		list: async (params) => (await apiClient.get('/products', { params })).data.products,
		myProducts: async () => (await apiClient.get('/farmer/products')).data.products,
		create: async (payload) => (a
			wait apiClient.post('/products', payload)).data,
		update: async (id, payload) => (await apiClient.put(`/products/${id}`, payload)).data,
		remove: async (id) => (await apiClient.delete(`/products/${id}`)).data,
	},
	markets: {
		list: async (params) => (await apiClient.get('/markets', { params })).data.markets,
		create: async (payload) => (await apiClient.post('/markets', payload)).data,
		update: async (id, payload) => (await apiClient.put(`/markets/${id}`, payload)).data,
		remove: async (id) => (await apiClient.delete(`/markets/${id}`)).data,
	},
	orders: {
		create: async (payload) => (await apiClient.post('/orders', payload)).data,
		customer: async () => (await apiClient.get('/customer/orders')).data.orders,
		farmer: async () => (await apiClient.get('/farmer/orders')).data.orders,
		updateStatus: async (id, status) => (await apiClient.patch(`/orders/${id}/status`, { status })).data,
	},
	user: {
		profile: async () => (await apiClient.get('/user/profile')).data.user,
		updateFarmerProfile: async (payload) => (await apiClient.put('/farmer/profile', payload)).data,
		toggleFavorite: async (itemType, itemId) => (await apiClient.post('/user/favorites', { itemType, itemId })).data,
	},
	reviews: {
		create: async (payload) => (await apiClient.post('/reviews', payload)).data,
		customer: async () => (await apiClient.get('/customer/reviews')).data.reviews,
		forFarmer: async (id) => (await apiClient.get(`/farmers/${id}/reviews`)).data.reviews,
		respond: async (id, comment) => (await apiClient.post(`/reviews/${id}/respond`, { comment })).data,
	},
	admin: {
		dashboard: async () => (await apiClient.get('/admin/dashboard')).data.data,
		users: async (params) => (await apiClient.get('/admin/users', { params })).data.data,
		updateUser: async (id, payload) => (await apiClient.put(`/admin/users/${id}`, payload)).data,
		removeUser: async (id) => (await apiClient.delete(`/admin/users/${id}`)).data,
	},
};

export default apiClient;
