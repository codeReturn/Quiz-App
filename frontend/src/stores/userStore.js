import { create } from 'zustand';
import axios from 'axios';

export const useUserStore = create((set) => ({
  userId: null,
  token: null,
  expirationDate: null,
  user: null,

  login: (userId, token, expirationDate) => {
    localStorage.setItem('userData', JSON.stringify({ userId, token, expirationDate })); 
    set({ userId, token, expirationDate });
  },

  logout: () => {
    localStorage.removeItem('userData');
    set({ userId: null, token: null, expirationDate: null, user: null });
  },

  loadUser: () => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.token) {
      set(storedData);
    }
  },

  fetchUser: async () => {
    try {
      const { token } = JSON.parse(localStorage.getItem('userData')) || {};
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({ user: response.data.user });
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }
}));
