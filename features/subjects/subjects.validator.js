const validateSubject = (data) => {
  const errors = [];
  
  if (!data.nama_mapel || data.nama_mapel.trim().length < 2) {
    errors.push('Subject name must be at least 2 characters');
  }
  
  return errors;
};

const validateAssignSubject = (data) => {
  const errors = [];
  
  if (!data.class_id) {
    errors.push('Class ID is required');
  }
  
  if (!data.subject_id) {
    errors.push('Subject ID is required');
  }
  
  return errors;
};

module.exports = {
  validateSubject,
  validateAssignSubject,
};
