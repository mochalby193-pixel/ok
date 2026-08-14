import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook untuk mendeteksi inaktivitas pengguna dan memanggil callback logout.
 *
 * @param {Function} onIdle - Fungsi yang dipanggil saat pengguna idle
 * @param {number}   timeout - Durasi idle dalam milidetik (default: 30 menit)
 * @param {boolean}  enabled - Aktifkan/nonaktifkan hook ini
 */
const useIdleTimeout = (onIdle, timeout = 30 * 60 * 1000, enabled = true) => {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  // Selalu pakai versi terbaru callback tanpa perlu restart listener
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    if (!enabled) return;

    // Event yang dianggap sebagai aktivitas pengguna
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
      'wheel',
    ];

    // Mulai timer pertama kali
    resetTimer();

    // Reset timer setiap ada aktivitas
    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [enabled, resetTimer]);
};

export default useIdleTimeout;
