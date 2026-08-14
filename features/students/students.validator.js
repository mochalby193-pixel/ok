/**
 * Validate progress submission
 */
const validateProgress = (data) => {
  const errors = [];
  
  if (!data.lesson_id) {
    errors.push('Lesson ID is required');
  }
  
  if (typeof data.is_completed !== 'boolean') {
    errors.push('is_completed must be a boolean');
  }
  
  return errors;
};

/**
 * Validate quiz answer submission
 */
const validateQuizAnswer = (data) => {
  const errors = [];
  
  if (!data.quiz_id) {
    errors.push('Quiz ID is required');
  }
  
  if (!data.jawaban_siswa) {
    errors.push('Answer is required');
  } else if (!['a', 'b', 'c', 'd'].includes(data.jawaban_siswa.toLowerCase())) {
    errors.push('Answer must be a, b, c, or d');
  }
  
  return errors;
};

module.exports = {
  validateProgress,
  validateQuizAnswer,
};
