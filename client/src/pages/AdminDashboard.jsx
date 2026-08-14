import { useState, useEffect, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { adminService } from '../services/adminService';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

// ─── Animated Counter ────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, duration = 1500, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString('id-ID')}{suffix}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, suffix = '', gradient, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all duration-700 ${gradient}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* decorative circle */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white opacity-10" />
      <div className="absolute -right-2 bottom-2 w-14 h-14 rounded-full bg-white opacity-10" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
          <p className="text-4xl font-extrabold tracking-tight">
            {visible ? (
              <AnimatedCounter target={Number(value)} suffix={suffix} duration={1400} />
            ) : (
              <span>0</span>
            )}
          </p>
        </div>
        <div className="text-4xl opacity-90 ml-2">{icon}</div>
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, color = 'bg-indigo-500', delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 300);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-800">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

// ─── Menu Card ────────────────────────────────────────────────────────────────
const MenuCard = ({ to, icon, title, desc, badge, color, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Link to={to}>
      <div
        className={`group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
          hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ transitionDelay: `${delay}ms`, transition: 'opacity 0.6s, transform 0.6s' }}
      >
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${color} mb-4
          group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {badge && (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <h3 className="text-base font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
        <div className={`mt-3 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-full ${color.replace('bg-', 'bg-').replace('/10', '')}`} />
      </div>
    </Link>
  );
};

// ─── Recent Activity Item ─────────────────────────────────────────────────────
const ActivityItem = ({ item, index }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  return (
    <div
      className={`flex items-start gap-3 py-3 border-b border-gray-50 last:border-0
        transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
        ${item.is_completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
        {item.is_completed ? '✓' : '→'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.nama}</p>
        <p className="text-xs text-gray-500 truncate">{item.judul_bab}</p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(item.updated_at)}</span>
    </div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const { data: stats, loading, error, refetch } = useFetch(() => adminService.getStats(), []);
  const { user } = useAuth();
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const statCards = [
    { icon: '🎓', label: 'Total Siswa', value: stats?.total_students, suffix: '', gradient: 'bg-gradient-to-br from-violet-500 to-purple-700', delay: 0 },
    { icon: '👨‍🏫', label: 'Total Guru', value: stats?.total_teachers, suffix: '', gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600', delay: 80 },
    { icon: '🏫', label: 'Kelas Aktif', value: stats?.total_classes, suffix: '', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', delay: 160 },
    { icon: '📚', label: 'Mata Pelajaran', value: stats?.total_subjects, suffix: '', gradient: 'bg-gradient-to-br from-orange-400 to-rose-500', delay: 240 },
    { icon: '📖', label: 'Materi Aktif', value: stats?.total_lessons, suffix: '', gradient: 'bg-gradient-to-br from-indigo-500 to-blue-600', delay: 320 },
    { icon: '📝', label: 'Total Kuis', value: stats?.total_quizzes, suffix: '', gradient: 'bg-gradient-to-br from-pink-500 to-fuchsia-600', delay: 400 },
    { icon: '📈', label: 'Rata-rata Progress', value: stats?.average_progress, suffix: '%', gradient: 'bg-gradient-to-br from-amber-500 to-yellow-500', delay: 480 },
    { icon: '⭐', label: 'Rata-rata Skor Kuis', value: stats?.avg_quiz_score, suffix: '', gradient: 'bg-gradient-to-br from-lime-500 to-green-600', delay: 560 },
  ];

  const menuItems = [
    { to: '/admin/classes', icon: '🏫', title: 'Kelola Kelas', desc: 'Tambah, edit, atau hapus kelas', color: 'bg-blue-100 text-blue-600', delay: 100 },
    { to: '/admin/subjects', icon: '📚', title: 'Kelola Mata Pelajaran', desc: 'Atur mapel dan assign ke kelas', color: 'bg-purple-100 text-purple-600', delay: 150 },
    { to: '/admin/lessons', icon: '📖', title: 'Kelola Materi', desc: 'Upload dan kelola materi pelajaran', color: 'bg-green-100 text-green-600', delay: 200 },
    { to: '/admin/quizzes', icon: '📝', title: 'Kelola Kuis', desc: 'Buat dan kelola soal kuis', color: 'bg-orange-100 text-orange-600', delay: 250 },
    { to: '/admin/assignments', icon: '📋', title: 'Kelola Penugasan', desc: 'Assign guru dan kelas ke mapel', color: 'bg-teal-100 text-teal-600', delay: 300 },
    ...(user?.role === ROLES.ADMIN
      ? [{ to: '/admin/users', icon: '👥', title: 'Manajemen Pengguna', desc: 'Kelola akun & import via Excel', color: 'bg-rose-100 text-rose-600', delay: 350 }]
      : []),
  ];

  const barColors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-orange-500', 'bg-indigo-500', 'bg-pink-500',
    'bg-teal-500', 'bg-amber-500',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className={`mb-8 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Dashboard Admin
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Selamat datang, <span className="font-semibold text-indigo-600">{user?.nama}</span> — ringkasan sistem per hari ini
              </p>
            </div>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Breadcrumb bar */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
            Sistem berjalan normal
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            : statCards.map((card, i) => (
                <StatCard key={i} {...card} />
              ))
          }
        </div>

        {/* ── Middle Row: Progress + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Completion by Class */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-base">Tingkat Penyelesaian per Kelas</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">% selesai</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6" />)}
              </div>
            ) : stats?.completion_by_class?.length > 0 ? (
              stats.completion_by_class.map((cls, i) => (
                <ProgressBar
                  key={i}
                  label={cls.nama_kelas}
                  value={parseFloat(cls.completion_rate) || 0}
                  color={barColors[i % barColors.length]}
                  delay={i * 100}
                />
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada data progress kelas</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-base">Aktivitas Terkini</h2>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : stats?.recent_activity?.length > 0 ? (
              <div>
                {stats.recent_activity.map((item, i) => (
                  <ActivityItem key={i} item={item} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada aktivitas</p>
            )}
          </div>
        </div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">✅</div>
            <div>
              <p className="text-xs text-gray-500">Materi Diselesaikan</p>
              <p className="text-2xl font-extrabold text-gray-800">
                {loading ? '—' : <AnimatedCounter target={stats?.completed_lessons || 0} />}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">🎯</div>
            <div>
              <p className="text-xs text-gray-500">Total Percobaan Kuis</p>
              <p className="text-2xl font-extrabold text-gray-800">
                {loading ? '—' : <AnimatedCounter target={stats?.total_quiz_attempts || 0} />}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">📊</div>
            <div>
              <p className="text-xs text-gray-500">Total Progress Tercatat</p>
              <p className="text-2xl font-extrabold text-gray-800">
                {loading ? '—' : <AnimatedCounter target={stats?.total_progress_records || 0} />}
              </p>
            </div>
          </div>
        </div>

        {/* ── Top Classes ── */}
        {!loading && stats?.top_classes?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-bold text-gray-800 text-base mb-4">🏆 Kelas Teraktif</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-semibold">#</th>
                    <th className="pb-3 font-semibold">Nama Kelas</th>
                    <th className="pb-3 font-semibold">Tingkat</th>
                    <th className="pb-3 font-semibold text-right">Selesai</th>
                    <th className="pb-3 font-semibold text-right">Total</th>
                    <th className="pb-3 font-semibold text-right">Rasio</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_classes.map((cls, i) => {
                    const ratio = cls.total_count > 0
                      ? ((cls.completed_count / cls.total_count) * 100).toFixed(0)
                      : 0;
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-bold text-gray-400">{i + 1}</td>
                        <td className="py-3 font-semibold text-gray-800">{cls.nama_kelas}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                            {cls.tingkat}
                          </span>
                        </td>
                        <td className="py-3 text-right text-green-600 font-semibold">{cls.completed_count}</td>
                        <td className="py-3 text-right text-gray-500">{cls.total_count}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-500 h-1.5 rounded-full"
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-8 text-right">{ratio}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Menu Navigation ── */}
        <div>
          <h2 className="font-bold text-gray-800 text-base mb-4">Menu Manajemen</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {menuItems.map((item, i) => (
              <MenuCard key={i} {...item} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
