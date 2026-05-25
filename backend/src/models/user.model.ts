export type UserRole = 'Admin' | 'General User';
export type VerificationStatus = 'Verified' | 'Pending' | 'Failed Verification' | 'In Progress';

export interface User {
  id: number;
  userId: string;
  name: string;
  role: UserRole;
  status: VerificationStatus;
  password?: string;
  email: string;
  phone: string;
  department: string;
  joinedDate: string;
  comments?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: UserRole;
    status: VerificationStatus;
    email: string;
  };
}
