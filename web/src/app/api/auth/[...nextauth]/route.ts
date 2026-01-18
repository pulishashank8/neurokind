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

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            include: { userRoles: true, profile: true },
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
            name: user.profile?.displayName || user.profile?.username || user.email,
            username: user.profile?.username,
            roles: user.userRoles.map((ur: any) => ur.role),
          };
        } catch (err) {
          // Fallback: allow dev login without DB if env flag is set
          if (process.env.ALLOW_DEV_LOGIN_WITHOUT_DB === "true") {
            const devAccounts: Record<string, { password: string; roles: string[] }> = {
              "admin@neurokind.local": { password: "admin123", roles: ["ADMIN"] },
              "parent@neurokind.local": { password: "parent123", roles: ["PARENT"] },
            };
            const acct = devAccounts[parsed.data.email];
            if (acct && acct.password === parsed.data.password) {
              return {
                id: parsed.data.email,
                email: parsed.data.email,
                name: parsed.data.email,
                roles: acct.roles,
              } as any;
            }
          }
          return null;
        }
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
    async signIn({ user, account }) {
      // For Google OAuth: auto-create profile if user doesn't have one
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { profile: true, userRoles: true },
          });

          if (existingUser && !existingUser.profile) {
            // Generate username from Google name or email
            let baseUsername = user.name?.toLowerCase().replace(/\s+/g, "") || user.email.split("@")[0];
            baseUsername = baseUsername.replace(/[^a-z0-9]/g, "");
            
            // Ensure username is unique
            let username = baseUsername;
            let counter = 1;
            while (true) {
              const exists = await prisma.profile.findUnique({ where: { username } });
              if (!exists) break;
              username = `${baseUsername}${counter}`;
              counter++;
            }

            // Create profile
            await prisma.profile.create({
              data: {
                userId: existingUser.id,
                username,
                displayName: user.name || username,
              },
            });

            // Ensure user has PARENT role
            if (existingUser.userRoles.length === 0) {
              await prisma.userRole.create({
                data: {
                  userId: existingUser.id,
                  role: "PARENT",
                },
              });
            }
          }
        } catch (err) {
          console.error("Error creating profile for Google user:", err);
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.roles = (user as any).roles || [];
      }

      // Refresh user data including username on every token update
      if (token.id) {
        try {
          const userData = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { userRoles: true, profile: true },
          });
          if (userData) {
            token.roles = userData.userRoles.map((ur: any) => ur.role);
            token.name = userData.profile?.displayName || userData.profile?.username || userData.email;
            token.username = userData.profile?.username;
          }
        } catch {
          // If DB unavailable, keep existing data (dev fallback)
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).roles = token.roles as string[];
        // Ensure session.user.name is set to displayName/username
        session.user.name = token.name as string;
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
