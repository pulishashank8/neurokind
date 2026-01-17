import "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      roles?: Role[];
    };
  }

  interface User {
    id: string;
    email: string;
    roles?: Role[];
  }

  interface JWT {
    id?: string;
    roles?: Role[];
  }
}
