import type { UserRole } from "../types/auth";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface SignInCredentials {
  name?: string;
  email: string;
  password: string;
}

export interface SignInForm {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  ready: boolean;
  signIn: (credentials: SignInCredentials, register?: boolean) => Promise<void>;
  signOut: () => void;
}
