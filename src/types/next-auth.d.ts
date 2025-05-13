import { UserRole } from "@/models/user";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    isActive: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
      isActive: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isActive: boolean;
  }
}
