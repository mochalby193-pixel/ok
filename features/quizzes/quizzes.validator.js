const { QUIZ_OPTIONS } = require('../../shared/constants');

const validateQuiz = (data) => {
  const errors = [];
  
  if (!data.lesson_id) {
    errors.push('Lesson ID is required');
  }
  
  if (!data.pertanyaan || data.pertanyaan.trim().length < 5) {
    errors.push('Question must be at least 5 characters');
  }
  
  if (!data.pilihan_a || data.pilihan_a.trim().length < 1) {
    errors.push('Option A is required');
  }
  
  if (!data.pilihan_b || data.pilihan_b.trim().length < 1) {
    errors.push('Option B is required');
  }
  
  if (!data.pilihan_c || data.pilihan_c.trim().length < 1) {
    errors.push('Option C is required');
  }
  
  if (!data.pilihan_d || data.pilihan_d.trim().length < 1) {
    errors.push('Option D is required');
  }
  
  if (!data.jawaban_benar) {
    errors.push('Correct answer is required');
  } else if (!QUIZ_OPTIONS.includes(data.jawaban_benar.toLowerCase())) {
    errors.push('Correct answer must be a, b, c, or d');
  }
  
  return errors;
};

module.exports = {
  validateQuiz,
};
