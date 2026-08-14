import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonService } from '../services/lessonService';
import { quizService } from '../services/quizService';
import { studentService } from '../services/studentService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { QuizCard } from '../components/QuizCard';
import { ConfirmModal } from '../components/ConfirmModal';

// Convert a relative /uploads/... path or Google Drive URL to embeddable URL
const getFileUrl = (url) => {
  if (!url) return null;
  // Google Drive share link → convert to preview/embed URL
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  // Already absolute URL — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Root-relative path (legacy uploads)
  return url;
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&#]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  if (url.includes('youtube.com/embed/')) return url;
  return null;
};

const isImageUrl = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
const isVideoUrl = (url) => url && /\.(mp4|webm|ogg)$/i.test(url);

export const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Progress tracking
  const [pdfViewed, setPdfViewed] = useState(false);
  const [mediaViewed, setMediaViewed] = useState(false);

  // Jawaban lokal siswa sebelum disimpan: { [quizId]: 'a'|'b'|'c'|'d' }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Hasil kuis setelah disimpan: { [quizId]: { correctAnswer, isCorrect } }
  const [quizResults, setQuizResults] = useState({});

  // Apakah progress sudah tersimpan (lesson selesai)
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const [savingProgress, setSavingProgress] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [lessonData, quizzesData, progressData, quizScoresData] = await Promise.all([
          lessonService.getById(id),
          quizService.getAll(id),
          studentService.getLessonProgress(id),
          studentService.getLessonQuizScores(id),
        ]);

        setLesson(lessonData);
        setQuizzes(quizzesData);

        const alreadyDone = progressData?.is_completed === true;
        setIsAlreadyCompleted(alreadyDone);
        if (alreadyDone) setProgressSaved(true);

        // Restore jawaban & hasil dari DB jika sudah pernah dikerjakan
        if (quizScoresData && quizScoresData.length > 0) {
          const answers = {};
          const results = {};
          quizScoresData.forEach((s) => {
            answers[s.quiz_id] = s.jawaban_siswa;
            results[s.quiz_id] = {
              correctAnswer: s.jawaban_benar,
              isCorrect: s.is_correct,
            };
          });
          setSelectedAnswers(answers);
          // Tampilkan hasil langsung jika sudah selesai
          if (alreadyDone) setQuizResults(results);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Derived state ───────────────────────────────────────────────────────────
  const hasPdf = !!lesson?.pdf_url;
  const hasMedia = !!lesson?.media_url;
  const hasQuiz = quizzes.length > 0;
  const allQuizAnswered = hasQuiz && quizzes.every((q) => !!selectedAnswers[q.id]);

  const pdfUrl = getFileUrl(lesson?.pdf_url);
  const mediaUrl = getFileUrl(lesson?.media_url);

  const calculateProgress = () => {
    const components = [];
    if (hasPdf) components.push(pdfViewed || isAlreadyCompleted);
    if (hasMedia) components.push(mediaViewed || isAlreadyCompleted);
    if (hasQuiz) components.push(allQuizAnswered);
    if (components.length === 0) return 100;
    return Math.round((components.filter(Boolean).length / components.length) * 100);
  };

  const progress = calculateProgress();
  const isFullyComplete = progress === 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  // ── Simpan progress (dipanggil setelah konfirmasi) ──────────────────────────
  const doSaveProgress = async () => {
    try {
      setSavingProgress(true);

      if (hasQuiz) {
        const submissions = quizzes.map((q) =>
          studentService.submitQuizAnswer(q.id, selectedAnswers[q.id])
        );
        const results = await Promise.all(submissions);

        const resultsMap = {};
        results.forEach((res, i) => {
          resultsMap[quizzes[i].id] = {
            correctAnswer: res.correct_answer,
            isCorrect: res.is_correct,
          };
        });
        setQuizResults(resultsMap);
      }

      await studentService.saveProgress(id, true);
      setIsAlreadyCompleted(true);
      setProgressSaved(true);
    } catch (err) {
      alert('Gagal menyimpan progress: ' + err.message);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSaveClick = () => {
    // Jika ada kuis, tampilkan konfirmasi; jika tidak langsung simpan
    if (hasQuiz) {
      setShowConfirmModal(true);
    } else {
      doSaveProgress();
    }
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    doSaveProgress();
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-danger p-8">{error}</div>;
  if (!lesson) return <div className="text-center p-8">Materi tidak ditemukan</div>;

  const correctCount = Object.values(quizResults).filter((r) => r.isCorrect).length;
  const nilaiAkhir = hasQuiz && quizzes.length > 0
    ? Math.round((correctCount / quizzes.length) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Popup konfirmasi */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title="Simpan Jawaban Kuis?"
          message="Apakah kamu sudah yakin dengan jawaban kuis materi ini? Jawaban tidak bisa diubah setelah disimpan."
          confirmLabel="Ya, Simpan"
          cancelLabel="Cek Lagi"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmModal(false)}
        />

        {/* Tombol Kembali */}
        <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="mb-6">
          ← Kembali ke Dashboard
        </Button>

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full">
              {lesson.nama_mapel}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Kelas {lesson.tingkat} · {lesson.nama_kelas}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-3">{lesson.judul_bab}</h1>
          {isAlreadyCompleted && (
            <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-success bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              ✓ Materi sudah diselesaikan
            </span>
          )}
        </div>

        {/* ── Progress Bar ── */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress Materi</span>
            <span className="text-sm font-bold text-primary">{isAlreadyCompleted ? 100 : progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${isAlreadyCompleted ? 100 : progress}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {hasPdf && (
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${pdfViewed || isAlreadyCompleted ? 'border-success text-success bg-green-50' : 'border-gray-300 text-gray-500'}`}>
                {pdfViewed || isAlreadyCompleted ? '✓' : '○'} PDF Materi
              </span>
            )}
            {hasMedia && (
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${mediaViewed || isAlreadyCompleted ? 'border-success text-success bg-green-50' : 'border-gray-300 text-gray-500'}`}>
                {mediaViewed || isAlreadyCompleted ? '✓' : '○'} Media
              </span>
            )}
            {hasQuiz && (
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${allQuizAnswered ? 'border-success text-success bg-green-50' : 'border-gray-300 text-gray-500'}`}>
                {allQuizAnswered ? '✓' : '○'} Kuis ({answeredCount}/{quizzes.length})
              </span>
            )}
          </div>
        </div>

        {/* ── PDF Viewer ── */}
        {hasPdf && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📄 Materi PDF</h2>
            <div
              className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              style={{ height: '520px' }}
            >
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Materi"
                allow="autoplay"
                onLoad={() => setPdfViewed(true)}
              />
            </div>
            <div className="flex items-center gap-4 mt-3">
              <a
                href={lesson?.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-primary hover:underline"
                onClick={() => setPdfViewed(true)}
              >
                ↗ Buka PDF di tab baru
              </a>
              {!pdfViewed && !isAlreadyCompleted && (
                <button
                  className="text-xs text-gray-400 underline"
                  onClick={() => setPdfViewed(true)}
                >
                  Tandai PDF sudah dibaca
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Media ── */}
        {hasMedia && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎬 Media Pembelajaran</h2>
            {isImageUrl(lesson.media_url) ? (
              <img src={mediaUrl} alt={lesson.judul_bab} className="w-full rounded-lg shadow-sm" onLoad={() => setMediaViewed(true)} />
            ) : isVideoUrl(lesson.media_url) ? (
              <video controls className="w-full rounded-lg shadow-sm" src={mediaUrl} onPlay={() => setMediaViewed(true)} />
            ) : getYoutubeEmbedUrl(lesson.media_url) ? (
              <div className="relative w-full rounded-lg overflow-hidden shadow-sm" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={getYoutubeEmbedUrl(lesson.media_url)}
                  title={lesson.judul_bab}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setMediaViewed(true)}
                />
              </div>
            ) : (
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" onClick={() => setMediaViewed(true)}>
                📎 Buka Media
              </a>
            )}
            {!mediaViewed && !isAlreadyCompleted && (
              <button className="mt-3 text-xs text-gray-400 underline" onClick={() => setMediaViewed(true)}>
                Tandai media sudah ditonton
              </button>
            )}
          </div>
        )}

        {/* ── Konten Teks ── */}
        {lesson.konten_teks && lesson.konten_teks.trim() && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Isi Materi</h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {lesson.konten_teks}
            </div>
          </div>
        )}

        {/* ── Kuis Latihan ── */}
        {hasQuiz && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-gray-800">📝 Kuis Latihan</h2>
              {isAlreadyCompleted && (
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  🔒 Terkunci
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {isAlreadyCompleted
                ? 'Kuis sudah dikerjakan dan tidak bisa diubah.'
                : 'Pilih jawaban untuk setiap soal. Kamu bisa mengubah pilihan sebelum menyimpan progress.'}
            </p>
            <div className="space-y-4">
              {quizzes.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  question={`${index + 1}. ${quiz.pertanyaan}`}
                  options={{
                    a: quiz.pilihan_a,
                    b: quiz.pilihan_b,
                    c: quiz.pilihan_c,
                    d: quiz.pilihan_d,
                  }}
                  selectedAnswer={selectedAnswers[quiz.id] || null}
                  onSelect={(key) => {
                    // Kunci pilihan jika sudah selesai
                    if (!isAlreadyCompleted) {
                      setSelectedAnswers((prev) => ({ ...prev, [quiz.id]: key }));
                    }
                  }}
                  correctAnswer={quizResults[quiz.id]?.correctAnswer || null}
                  showResult={isAlreadyCompleted}
                />
              ))}
            </div>

            {/* Rekap nilai — tampil setelah simpan */}
            {isAlreadyCompleted && nilaiAkhir !== null && (
              <div className="mt-6 p-5 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <p className="text-gray-500 text-sm mb-1">Hasil Kuis</p>
                <p className="text-3xl font-extrabold text-primary">
                  {correctCount}
                  <span className="text-lg font-normal text-gray-400"> / {quizzes.length} benar</span>
                </p>
                <p className="text-xl font-bold text-gray-700 mt-1">
                  Nilai:{' '}
                  <span className={nilaiAkhir >= 80 ? 'text-success' : nilaiAkhir >= 60 ? 'text-yellow-500' : 'text-danger'}>
                    {nilaiAkhir}
                  </span>
                  <span className="text-sm font-normal text-gray-400"> / 100</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Simpan Progress ── */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          {isAlreadyCompleted ? (
            <div>
              <p className="text-2xl font-bold text-success mb-2">✓ Progress Tersimpan!</p>
              <p className="text-gray-400 text-sm mb-6">Materi ini sudah kamu selesaikan.</p>
              <Button onClick={() => navigate('/student/dashboard')} className="px-8 py-2">
                ← Kembali ke Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className={`text-4xl font-extrabold ${isFullyComplete ? 'text-success' : 'text-gray-300'}`}>
                  {progress}%
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  {isFullyComplete
                    ? 'Semua komponen selesai! Kamu bisa menyimpan progress.'
                    : 'Selesaikan semua komponen untuk menyimpan progress.'}
                </p>
              </div>
              <Button
                onClick={handleSaveClick}
                disabled={!isFullyComplete || savingProgress}
                className={`px-8 py-3 text-lg ${!isFullyComplete ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {savingProgress ? 'Menyimpan...' : '✓ Simpan Progress'}
              </Button>
              {!isFullyComplete && (
                <p className="text-xs text-gray-400 mt-3">
                  Selesaikan{' '}
                  {[
                    hasPdf && !pdfViewed && 'PDF Materi',
                    hasMedia && !mediaViewed && 'Media',
                    hasQuiz && !allQuizAnswered && `Kuis (${answeredCount}/${quizzes.length} soal)`,
                  ]
                    .filter(Boolean)
                    .join(', ')}{' '}
                  terlebih dahulu.
                </p>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
