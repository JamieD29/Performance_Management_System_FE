export interface DepartmentOption {
    id: string;
    name: string;
    code: string;
}

export interface ProfileFormData {
    // Step 1: Personal Info
    employeeId: string;
    fullName: string;
    dob: string;
    email: string;
    joinDate: string;
    
    // Step 2: Work Info
    departmentId: string;
    academicRank: string;
    degree: string;
    jobTitle: string;
}
