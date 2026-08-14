import { useAuth } from '../hooks/useAuth';

/**
 * Banner kuning yang muncul di bagian atas layar saat sesi hampir habis.
 * Pengguna bisa menutupnya atau langsung logout.
 */
export const SessionWarning = () => {
  const { sessionWarning, dismissWarning, logout } = useAuth();

  if (!sessionWarning) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4
                 bg-yellow-400 px-4 py-3 text-sm font-medium text-yellow-900 shadow-md"
    >
      <span>
        ⚠️ Sesi Anda akan segera berakhir. Simpan pekerjaan Anda sebelum otomatis logout.
      </span>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={dismissWarning}
          className="rounded bg-yellow-200 px-3 py-1 hover:bg-yellow-300 transition-colors"
        >
          Tutup
        </button>
        <button
          onClick={() => logout('manual')}
          className="rounded bg-yellow-700 px-3 py-1 text-white hover:bg-yellow-800 transition-colors"
        >
          Logout Sekarang
        </button>
      </div>
    </div>
  );
};
