export const QuizCard = ({
  question,
  options,
  selectedAnswer = null,   // dikontrol parent
  onSelect,                // (key) => void — parent simpan ke state lokal
  correctAnswer = null,    // hanya diisi setelah simpan progress
  showResult = false,
}) => {
  const getOptionClass = (key) => {
    if (showResult) {
      if (key === correctAnswer) return 'border-success bg-green-50 text-green-800';
      if (key === selectedAnswer && key !== correctAnswer) return 'border-danger bg-red-50 text-red-700';
      return 'border-gray-200 text-gray-400';
    }
    // Belum simpan — hanya highlight pilihan aktif
    return selectedAnswer === key
      ? 'border-primary bg-blue-50 text-gray-800'
      : 'border-gray-200 hover:border-primary hover:bg-blue-50 text-gray-700';
  };

  const getBadgeClass = (key) => {
    if (showResult) {
      if (key === correctAnswer) return 'border-success bg-success text-white';
      if (key === selectedAnswer && key !== correctAnswer) return 'border-danger bg-danger text-white';
    }
    if (selectedAnswer === key) return 'border-primary bg-primary text-white';
    return 'border-gray-300 bg-white text-gray-500';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-base font-semibold text-gray-800 mb-4">{question}</p>

      <div className="space-y-2">
        {Object.entries(options).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => !showResult && onSelect(key)}
            disabled={showResult}
            className={`w-full p-3.5 text-left border-2 rounded-lg transition-all flex items-center gap-3 ${getOptionClass(key)} ${
              showResult ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${getBadgeClass(key)}`}>
              {key.toUpperCase()}
            </span>
            <span className="flex-1 text-sm">{value}</span>
            {showResult && key === correctAnswer && (
              <span className="shrink-0 text-success font-bold">✓</span>
            )}
            {showResult && key === selectedAnswer && key !== correctAnswer && (
              <span className="shrink-0 text-danger font-bold">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback hasil — hanya setelah simpan */}
      {showResult && (
        <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
          selectedAnswer === correctAnswer ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {selectedAnswer === correctAnswer
            ? '🎉 Jawaban kamu benar!'
            : `❌ Jawaban salah — yang benar: ${correctAnswer?.toUpperCase()}`}
        </div>
      )}
    </div>
  );
};
