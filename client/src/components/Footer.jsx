export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto text-gray-300 bg-gray-800">
      {/* Top divider accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 items-start md:grid-cols-3">

          {/* ── Kolom 1: Logo-logo ── */}
          <div className="flex flex-col gap-4 items-center md:items-start">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Didukung Oleh</p>
            <div className="flex gap-5 items-center">
              <img
                src="/logo1.png"
                alt="Logo 1"
                className="object-contain w-auto h-12 opacity-90 transition-opacity hover:opacity-100"
              />
              <img
                src="/logo2.png"
                alt="Logo 2"
                className="object-contain w-auto h-12 opacity-90 transition-opacity hover:opacity-100"
              />
              <img
                src="/logo3.png"
                alt="Logo 3"
                className="object-contain w-auto h-12 opacity-90 transition-opacity hover:opacity-100"
              />
            </div>
          </div>

          {/* ── Kolom 2: Info Sekolah ── */}
          <div className="flex flex-col gap-1 items-center text-center">
            <p className="text-sm font-bold text-white">SDN SUCO 04</p>
            <p className="text-xs leading-relaxed text-gray-400">
              Jl. Suco No. 04, Kec. Mumbulsari<br />
              Kab. Jember, Jawa Timur 68173
            </p>
            <p className="mt-1 text-xs text-gray-500">Tahun Pelajaran {currentYear}/{currentYear + 1}</p>
          </div>

          {/* ── Kolom 3: Info Aplikasi ── */}
          <div className="flex flex-col gap-1 items-center text-center md:items-end md:text-right">
            <p className="text-sm font-bold text-white">Learning Management System</p>
            <p className="text-xs text-gray-400">Versi 1.0.0</p>
            <p className="text-xs text-gray-400">
              Dikembangkan oleh<br />
              <span className="font-medium text-indigo-400">Tim Pengembang SDN SUCO 04</span>
            </p>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col gap-2 justify-between items-center pt-5 mt-6 text-xs text-gray-500 border-t border-gray-700 sm:flex-row">
          <span>© {currentYear} LMS SDN SUCO 04 · Dinas Pendidikan Kab. Jember</span>
          <span>Semua hak dilindungi undang-undang</span>
        </div>
      </div>
    </footer>
  );
};
