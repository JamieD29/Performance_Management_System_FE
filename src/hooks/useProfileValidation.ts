export const useProfileValidation = () => {
  const minJoinDateStr = "1990-01-01"; // Updated fallback

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
    if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Calculates the minimum join date string (YYYY-MM-DD) based on date of birth (must be >= 23 years old)
   */
  const getMinJoinDateStr = (dob?: string) => {
    if (!dob) return minJoinDateStr;

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return minJoinDateStr;

    birthDate.setFullYear(birthDate.getFullYear() + 23);
    const dobPlus23Str = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
    
    return dobPlus23Str > minJoinDateStr ? dobPlus23Str : minJoinDateStr;
  };

  /**
   * Validates if age is at least 23 at the time of join date
   */
  const validateAgeAtJoinDate = (dob: string, joinDate: string): { dobError: string, joinDateError: string } => {
    if (!dob || !joinDate) return { dobError: "", joinDateError: "" };
    const age = calculateAgeAtDate(dob, joinDate);
    if (age < 23) {
      return {
        dobError: "Ngày tháng năm sinh không hợp lệ với ngày vào trường.",
        joinDateError: "Ngày vào trường không hợp lệ với ngày tháng năm sinh."
      };
    }
    return { dobError: "", joinDateError: "" };
  };

  /**
   * Validates if a join date is valid (not in future, and >= minimum allowed date)
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
      return `Ngày vào trường không hợp lệ (phải từ ngày ${minDateStr}).`;
    }
    return "";
  };

  return {
    isValidStaffCode,
    getMinJoinDateStr,
    validateJoinDateStr,
    validateAgeAtJoinDate,
    calculateAgeAtDate
  };
};
