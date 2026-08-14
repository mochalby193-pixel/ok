import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';

const features = [
  {
    icon: '📚',
    title: 'Materi Lengkap',
    desc: 'Akses materi pelajaran dalam format PDF dan video interaktif kapan saja dan di mana saja.',
  },
  {
    icon: '📝',
    title: 'Kuis & Latihan',
    desc: 'Uji pemahaman dengan kuis pilihan ganda yang dinilai otomatis dan langsung menampilkan hasil.',
  },
  {
    icon: '📊',
    title: 'Pantau Progres',
    desc: 'Guru dan admin dapat memantau perkembangan belajar siswa secara real-time.',
  },
  {
    icon: '🏫',
    title: 'Manajemen Kelas',
    desc: 'Kelola kelas, mata pelajaran, dan penugasan siswa dengan mudah dalam satu platform.',
  },
  {
    icon: '👤',
    title: 'Multi Peran',
    desc: 'Sistem mendukung tiga peran: Admin, Guru, dan Siswa dengan akses yang sesuai.',
  },
  {
    icon: '🔒',
    title: 'Aman & Terpercaya',
    desc: 'Autentikasi berbasis JWT memastikan data dan akses pengguna tetap aman.',
  },
];

const roles = [
  {
    icon: '🛡️',
    role: 'Admin',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    items: ['Kelola pengguna (guru & siswa)', 'Kelola kelas & mata pelajaran', 'Atur penugasan siswa ke kelas', 'Lihat statistik & laporan'],
  },
  {
    icon: '👨‍🏫',
    role: 'Guru',
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    items: ['Upload materi pelajaran', 'Buat & kelola kuis', 'Pantau nilai siswa', 'Kelola konten per mata pelajaran'],
  },
  {
    icon: '🎓',
    role: 'Siswa',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    items: ['Akses materi yang diberikan', 'Ikuti kuis latihan', 'Lihat nilai & progres belajar', 'Kelola profil pribadi'],
  },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Navbar ── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-suco.png" alt="Logo" className="w-9 h-9 object-contain" />
            <div className="leading-tight">
              <span className="block font-bold text-primary text-sm leading-none">LMS SDN SUCO 04</span>
              <span className="block text-xs text-gray-500 leading-none mt-0.5">Learning Management System</span>
            </div>
          </div>
          <Link
            to="/login"
            className="btn btn-primary px-5 py-2 text-sm"
          >
            Masuk →
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden">
        {/* Dekorasi */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white bg-opacity-5 rounded-full" />
        <div className="absolute -bottom-24 -left-16 w-96 h-96 bg-white bg-opacity-5 rounded-full" />

        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Teks */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block bg-white bg-opacity-15 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
                Platform Pembelajaran Digital
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
                Belajar Lebih Mudah<br />
                <span className="text-secondary">Bersama LMS SDN SUCO 04</span>
              </h1>
              <p className="text-blue-100 text-base lg:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                Platform pembelajaran digital terintegrasi untuk siswa, guru, dan admin. Akses materi, ikuti kuis, dan pantau perkembangan belajar dalam satu tempat.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="btn bg-white text-primary font-semibold hover:bg-blue-50 px-7 py-3 text-base shadow-md"
                >
                  Mulai Sekarang →
                </Link>
                <a
                  href="#fitur"
                  className="btn border-2 border-white border-opacity-50 text-white hover:bg-white hover:bg-opacity-10 px-7 py-3 text-base"
                >
                  Pelajari Fitur
                </a>
              </div>
            </div>

            {/* Logo Panel */}
            <div className="flex-shrink-0 flex items-center gap-6 bg-white bg-opacity-10 rounded-2xl px-10 py-8 backdrop-blur-sm border border-white border-opacity-20">
              <img src="/logo-jember.png" alt="Logo Jember" className="w-20 h-20 object-contain drop-shadow-lg" />
              <div className="w-px h-16 bg-white bg-opacity-30" />
              <img src="/logo-suco.png" alt="Logo LMS" className="w-20 h-20 object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { value: '3', label: 'Peran Pengguna', icon: '👥' },
            { value: '∞', label: 'Materi Pelajaran', icon: '📚' },
            { value: '100%', label: 'Penilaian Otomatis', icon: '✅' },
            { value: '24/7', label: 'Akses Kapan Saja', icon: '🕐' },
          ].map((s) => (
            <div key={s.label} className="p-4">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fitur ── */}
      <section id="fitur" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Fitur Unggulan</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Semua yang dibutuhkan untuk proses belajar mengajar yang efektif, tersedia dalam satu platform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card card-hover border border-gray-100">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Peran Pengguna ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Dirancang untuk Semua</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Setiap pengguna memiliki tampilan dan akses yang disesuaikan dengan perannya.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.role} className={`border rounded-2xl p-6 ${r.color}`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{r.icon}</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${r.badge}`}>
                    {r.role}
                  </span>
                </div>
                <ul className="space-y-2">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-20 text-white text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white bg-opacity-5 rounded-full" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-white bg-opacity-5 rounded-full" />
        <div className="max-w-xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl font-bold mb-4">Siap Mulai Belajar?</h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            Masuk dengan akun yang telah diberikan oleh administrator sekolahmu dan mulai perjalanan belajarmu hari ini.
          </p>
          <Link
            to="/login"
            className="btn bg-white text-primary font-semibold hover:bg-blue-50 px-8 py-3 text-base shadow-lg inline-block"
          >
            Masuk ke Aplikasi →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
};
