export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  avatar?: File | null;
};

export type UserRole = "CUSTOMER" | "COURT_OWNER" | "ADMIN";

export type UserResponse = {
  id: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthErrorResponse = {
  message?: string;
  fieldErrors?: Record<string, string>;
};
