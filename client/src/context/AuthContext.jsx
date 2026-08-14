import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import useIdleTimeout from '../hooks/useIdleTimeout';

export const AuthContext = createContext();

// Durasi idle sebelum auto logout (default: 30 menit)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

// Berapa menit sebelum token expired, tampilkan warning (default: 5 menit)
const EXPIRY_WARNING_BEFORE_MS = 5 * 60 * 1000;

/**
 * Decode JWT payload tanpa library tambahan.
 * Mengembalikan null jika token tidak valid.
 */
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false); // tampilkan peringatan sesi akan habis

  const expiryTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // ─── Fungsi logout terpusat ──────────────────────────────────────────────
  const logout = useCallback((reason = 'manual') => {
    authService.logout();
    setUser(null);
    setSessionWarning(false);
    clearTimeout(expiryTimerRef.current);
    clearTimeout(warningTimerRef.current);

    if (reason === 'idle') {
      // Simpan pesan agar bisa ditampilkan di halaman login
      sessionStorage.setItem(
        'logout_reason',
        'Sesi Anda berakhir karena tidak ada aktivitas.'
      );
    } else if (reason === 'expired') {
      sessionStorage.setItem(
        'logout_reason',
        'Sesi Anda telah berakhir. Silakan login kembali.'
      );
    }
  }, []);

  // ─── Jadwalkan timer expiry berdasarkan klaim "exp" di JWT ───────────────
  const scheduleExpiryLogout = useCallback(
    (token) => {
      clearTimeout(expiryTimerRef.current);
      clearTimeout(warningTimerRef.current);
      setSessionWarning(false);

      const decoded = decodeJwt(token);
      if (!decoded?.exp) return;

      const expiresAt = decoded.exp * 1000; // konversi ke ms
      const now = Date.now();
      const msUntilExpiry = expiresAt - now;

      if (msUntilExpiry <= 0) {
        // Token sudah expired
        logout('expired');
        return;
      }

      // Warning sebelum expired
      const msUntilWarning = msUntilExpiry - EXPIRY_WARNING_BEFORE_MS;
      if (msUntilWarning > 0) {
        warningTimerRef.current = setTimeout(() => {
          setSessionWarning(true);
        }, msUntilWarning);
      } else {
        // Sudah dalam window warning
        setSessionWarning(true);
      }

      // Logout tepat saat token expired
      expiryTimerRef.current = setTimeout(() => {
        logout('expired');
      }, msUntilExpiry);
    },
    [logout]
  );

  // ─── Dismiss warning (pengguna masih aktif) ──────────────────────────────
  const dismissWarning = () => setSessionWarning(false);

  // ─── Init: baca token dari localStorage saat mount ───────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      // Cek token belum expired sebelum restore sesi
      const decoded = decodeJwt(token);
      const isExpired = decoded?.exp && decoded.exp * 1000 < Date.now();

      if (isExpired) {
        authService.logout();
        setLoading(false);
        return;
      }

      setUser(JSON.parse(storedUser));
      scheduleExpiryLogout(token);
      setLoading(false);
    } else if (token) {
      authService
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          scheduleExpiryLogout(token);
        })
        .catch(() => {
          authService.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      clearTimeout(expiryTimerRef.current);
      clearTimeout(warningTimerRef.current);
    };
  }, [scheduleExpiryLogout]);

  // ─── Login ───────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const { token, user: userData } = await authService.login(credentials);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    scheduleExpiryLogout(token);
    return userData;
  };

  // ─── Auto logout saat idle ───────────────────────────────────────────────
  // Hook hanya aktif jika pengguna sudah login
  useIdleTimeout(
    () => logout('idle'),
    IDLE_TIMEOUT_MS,
    !!user
  );

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    sessionWarning,      // true = tampilkan banner "sesi akan segera berakhir"
    dismissWarning,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
