import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { Loader } from '../components/Loader';

const getNilaiColor = (nilai) => {
  if (nilai === null || nilai === undefined) return 'bg-gray-100 text-gray-400 border-gray-200';
  if (nilai >= 80) return 'bg-green-50 text-green-700 border-green-200';
  if (nilai >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-red-50 text-red-600 border-red-200';
};

export const StudentDashboard = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState(null);
  const [lessonScores, setLessonScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardData, scoresData] = await Promise.all([
          studentService.getDashboard(),
          studentService.getLessonScores(),
        ]);
        setSubjects(dashboardData);
        const map = {};
        scoresData.forEach((s) => { map[s.lesson_id] = s; });
        setLessonScores(map);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-danger p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌟 Dashboard Belajar</h1>
          <p className="text-gray-600 text-lg">Selamat datang! Mari kita mulai belajar hari ini 🚀</p>
        </div>

        {subjects && subjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Belum ada materi pelajaran tersedia</p>
          </div>
        )}

        {subjects && subjects.map((subject) => (
          <div key={subject.subject_name} className="mb-12">
            <div className="flex items-center mb-6">
              {subject.subject_icon && (
                <img src={subject.subject_icon} alt={subject.subject_name} className="w-12 h-12 mr-4" />
              )}
              <h2 className="text-3xl font-bold text-primary">📚 {subject.subject_name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subject.lessons.map((lesson) => {
                const score = lessonScores[lesson.lesson_id];

                // quiz_count dari dashboard sudah di-parse jadi integer di controller
                const quizCount = parseInt(lesson.quiz_count) || 0;

                // Nilai dari lessonScores (null = belum kerjakan, 0–100 = sudah)
                const nilai = score && score.nilai !== null ? parseInt(score.nilai) : null;
                const soalDijawab = score ? parseInt(score.soal_dijawab) : 0;
                const totalSoal = score ? parseInt(score.total_soal) : quizCount;

                const isCompleted = lesson.is_completed;

                return (
                  <div
                    key={lesson.lesson_id}
                    onClick={() => navigate(`/student/lesson/${lesson.lesson_id}`)}
                    className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 shadow-sm
                      ${isCompleted
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-400 hover:shadow-green-200 hover:shadow-lg hover:-translate-y-1'
                        : 'bg-white border-gray-200 hover:border-primary hover:shadow-lg hover:-translate-y-1'
                      }`}
                  >
                    {/* Ribbon "Selesai" di pojok kanan atas */}
                    {isCompleted && (
                      <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none">
                        <div className="absolute top-3 -right-5 bg-green-500 text-white text-[10px] font-bold px-6 py-0.5 rotate-45 shadow">
                          SELESAI
                        </div>
                      </div>
                    )}

                    {/* Judul */}
                    <div className="flex items-start gap-2 mb-3 pr-6">
                      <span className={`text-xl ${isCompleted ? 'opacity-80' : ''}`}>
                        {isCompleted ? '✅' : '📖'}
                      </span>
                      <h3 className={`text-base font-bold leading-snug ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                        {lesson.judul_bab}
                      </h3>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={isCompleted ? 'text-green-700 font-medium' : 'text-gray-500'}>Progress</span>
                        <span className={`font-bold ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                          {isCompleted ? '100%' : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500 w-full' : 'bg-gray-300 w-0'}`}
                        />
                      </div>
                    </div>

                    {/* Badge konten */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lesson.pdf_url && (
                        <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full">
                          📄 PDF
                        </span>
                      )}
                      {lesson.media_url && (
                        <span className="text-xs bg-purple-50 text-purple-500 border border-purple-200 px-2 py-0.5 rounded-full">
                          🎬 Media
                        </span>
                      )}
                      {quizCount > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-500 border border-blue-200 px-2 py-0.5 rounded-full">
                          📝 {quizCount} Kuis
                        </span>
                      )}
                    </div>

                    {/* Nilai kuis — hanya tampil kalau ada kuis */}
                    {quizCount > 0 && (
                      <div className="mb-3">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${getNilaiColor(nilai)}`}>
                          🎯{' '}
                          {nilai !== null ? (
                            <>
                              <span className="text-sm font-bold">{nilai}</span>
                              <span className="font-normal opacity-75">/ 100</span>
                              <span className="mx-1 opacity-40">·</span>
                              <span className="font-normal">{soalDijawab}/{totalSoal} soal</span>
                            </>
                          ) : (
                            'Kuis belum dikerjakan'
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tombol aksi */}
                    <div className="flex items-center justify-between mt-2">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                          ✓ Sudah Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                          Mulai Belajar →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};
