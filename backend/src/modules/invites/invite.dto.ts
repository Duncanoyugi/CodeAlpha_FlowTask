import { Role } from '../../generated/prisma';

export interface CreateInviteDto {
  email: string;
  role?: Role;
}

export interface AcceptInviteDto {
  token: string;
}

export interface InviteResponseDto {
  id: string;
  workspaceId: string;
  email: string | null;
  role: Role;
  expiresAt: Date;
  createdAt: Date;
  workspace?: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}