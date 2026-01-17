import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validators";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validate input
        const parsed = LoginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!parsed.success) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { userRoles: true },
        });

        if (!user) {
          return null;
        }

        // Check password
        const passwordMatch = await bcryptjs.compare(
          parsed.data.password,
          user.hashedPassword || ""
        );

        if (!passwordMatch) {
          return null;
        }

        // Update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          roles: user.userRoles.map((ur: any) => ur.role),
        };
      },
    }),

    // Google OAuth provider (optional, only if env vars are set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles || [];
      }

      // Refresh roles on every token update
      if (token.id) {
        const userRoles = await prisma.userRole.findMany({
          where: { userId: token.id as string },
          select: { role: true },
        });
        token.roles = userRoles.map((ur: any) => ur.role);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).roles = token.roles as string[];
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Only redirect to allowed origins
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
