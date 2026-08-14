const validateLesson = (data) => {
  const errors = [];
  
  if (!data.class_subject_id) {
    errors.push('Class subject ID is required');
  }
  
  if (!data.judul_bab || data.judul_bab.trim().length < 3) {
    errors.push('Lesson title must be at least 3 characters');
  }
  
  if (!data.konten_teks || data.konten_teks.trim().length < 10) {
    errors.push('Lesson content must be at least 10 characters');
  }
  
  return errors;
};

module.exports = {
  validateLesson,
};
