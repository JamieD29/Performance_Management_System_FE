export const useProfileValidation = () => {
  const minJoinDateStr = "1996-01-01"; // Default fallback minimum date

  /**
   * Validates if a staff code is max 4 characters long and only contains digits
   */
  const isValidStaffCode = (code: string) => {
    return code === "" || /^\d{1,4}$/.test(code);
  };

  /**
   * Calculates the minimum join date string (YYYY-MM-DD) based on date of birth (must be >= 18 years old)
   */
  const getMinJoinDateStr = (dob?: string) => {
    if (!dob) return minJoinDateStr;

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return minJoinDateStr;

    birthDate.setFullYear(birthDate.getFullYear() + 18);
    const dobPlus18Str = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
    
    return dobPlus18Str > minJoinDateStr ? dobPlus18Str : minJoinDateStr;
  };

  /**
   * Validates if a join date is valid (not in future, and >= minimum allowed date)
   * Returns empty string if valid, otherwise returns error message
   */
  const validateJoinDateStr = (dateValue: string, minDateStr: string = minJoinDateStr): string => {
    if (!dateValue) return "";

    const selectedDate = new Date(dateValue);
    const currentDate = new Date();
    const minimumDate = new Date(minDateStr);

    if (selectedDate > currentDate) {
      return "Ngày vào trường không thể ở tương lai.";
    }
    if (selectedDate < minimumDate) {
      return `Không hợp lệ (phải từ ngày ${minDateStr}).`;
    }
    return "";
  };

  return {
    isValidStaffCode,
    getMinJoinDateStr,
    validateJoinDateStr,
  };
};
