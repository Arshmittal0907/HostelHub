export type Role = 'PLATFORM_ADMIN' | 'WARDEN' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  college?: {
    id: string;
    name: string;
    code: string;
    status: string;
  } | null;
  hostel?: {
    id: string;
    name: string;
    type: string;
  } | null;
  studentProfile?: {
    id: string;
    rollNumber: string;
    course: string;
    year: number;
    status: string;
    emergencyContact?: string | null;
    activeAllocation?: any;
  } | null;
  wardenAssignments?: Array<{
    id: string;
    hostelId: string;
    hostelName: string;
    hostelType: string;
  }>;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
