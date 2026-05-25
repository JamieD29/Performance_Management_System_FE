export const useProfileValidation = () => {
  const MIN_AGE_THRESHOLD = 20;
  const minJoinDateStr = "1995-01-01";

  /**
   * Validates if a staff code is max 4 characters long and only contains digits
   */
  const isValidStaffCode = (code: string) => {
    return code === "" || /^\d{1,4}$/.test(code);
  };

  /**
   * Calculates age based on DOB and another date (e.g., Join Date)
   */
  const calculateAgeAtDate = (dob: string, targetDate: string) => {
    const birth = new Date(dob);
    const target = new Date(targetDate);
    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return 0;

    let age = target.getFullYear() - birth.getFullYear();
    const monthDiff = target.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && target.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  /**
   * Calculates the minimum join date string (YYYY-MM-DD) based on date of birth (must be >= 20 years old)
   */
  const getMinJoinDateStr = (dob?: string) => {
    if (!dob) return minJoinDateStr;

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return minJoinDateStr;

    birthDate.setFullYear(birthDate.getFullYear() + MIN_AGE_THRESHOLD);
    const dobPlusMinAgeStr = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;

    return dobPlusMinAgeStr > minJoinDateStr ? dobPlusMinAgeStr : minJoinDateStr;
  };

  /**
   * Validates if age is at least MIN_AGE_THRESHOLD at the time of join date.
   * Returns warning (not hard error) — user can still proceed after confirming.
   */
  const validateAgeAtJoinDate = (
    dob: string,
    joinDate: string,
  ): { dobError: string; joinDateError: string; isAgeWarning: boolean } => {
    if (!dob || !joinDate) return { dobError: "", joinDateError: "", isAgeWarning: false };
    const age = calculateAgeAtDate(dob, joinDate);
    if (age < MIN_AGE_THRESHOLD) {
      return {
        dobError: `Độ tuổi tại thời điểm vào trường chỉ ${age} tuổi (yêu cầu ít nhất ${MIN_AGE_THRESHOLD} tuổi).`,
        joinDateError: `Tại thời điểm ngày vào trường, người dùng chỉ ${age} tuổi (cần ít nhất ${MIN_AGE_THRESHOLD} tuổi).`,
        isAgeWarning: true,
      };
    }
    return { dobError: "", joinDateError: "", isAgeWarning: false };
  };

  /**
   * Validates if a join date is valid (not in future, and >= minimum allowed date)
   */
  const validateJoinDateStr = (
    dateValue: string,
    minDateStr: string = minJoinDateStr,
  ): string => {
    if (!dateValue) return "";

    const selectedDate = new Date(dateValue);
    const currentDate = new Date();
    const minimumDate = new Date(minDateStr);

    if (selectedDate > currentDate) {
      return "Ngày vào trường không thể ở tương lai.";
    }
    if (selectedDate < minimumDate) {
      return `Ngày vào trường không hợp lệ (phải từ ngày 01/01/1995).`;
    }
    return "";
  };

  return {
    isValidStaffCode,
    getMinJoinDateStr,
    validateJoinDateStr,
    validateAgeAtJoinDate,
    calculateAgeAtDate,
  };
};
