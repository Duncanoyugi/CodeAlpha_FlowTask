export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}