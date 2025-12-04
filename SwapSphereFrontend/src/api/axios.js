import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // change to your HTTPS domain when ready
  withCredentials: true, // ✅ Enables sending cookies on each request
});

// List of public endpoints that don't need access token
const EXCLUDED_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

// No longer attaching token manually from localStorage
// Authorization header is optional now
api.interceptors.request.use((config) => {
  // You can still attach custom headers if needed
  return config;
});

// Handle 403 errors and retry with refresh cookie logic
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry &&
      !EXCLUDED_URLS.some(url => originalRequest.url.includes(url))
    ) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Attempting token refresh for 403 error...");
        // 🔁 Attempt token refresh (refresh token is stored in cookie)
        await api.post('/auth/refresh', {}, {
          withCredentials: true,
        });

        console.log("✅ Token refreshed, retrying original request...");
        // 🔁 Retry the original request (cookie now has updated access token)
        return api(originalRequest);

      } catch (err) {
        console.error("❌ Token refresh failed:", err);
        // 🔒 If refresh fails, call logout to invalidate refresh token (via cookie or DB)
        try {
          await api.post('/auth/logout', {}, {
            withCredentials: true,
          });
        } catch (logoutErr) {
          console.error("Logout failed silently:", logoutErr);
        }

        // 🔁 Clear any local state if needed
        alert("Session expired. Please log in again.");
        window.location.href = '/';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;