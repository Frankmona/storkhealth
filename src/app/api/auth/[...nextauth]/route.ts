import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || process.env.AZURE_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || process.env.AZURE_TENANT_ID || "common",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@storkfort.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // Check if it's the first time and we should seed a sysadmin
          if (credentials.email === "admin@storkfort.com" && credentials.password === "admin123") {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const newUser = await prisma.user.create({
              data: {
                name: "System Administrator",
                email: credentials.email,
                passwordHash: hashedPassword,
                role: "SYSADMIN"
              }
            });
            return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
          }
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // If signing in via Azure AD, ensure a corresponding local user exists
      if (user && account && account.provider === "azure-ad") {
        const email = (user as any).email;
        if (email) {
          try {
            let dbUser = await prisma.user.findUnique({ where: { email } });
            if (!dbUser) {
              dbUser = await prisma.user.create({ data: { name: (user as any).name || '', email, role: 'USER' } });
            }
            token.id = dbUser.id;
            token.role = dbUser.role;
          } catch (err) {
            console.error('Azure AD user sync error', err);
          }
        }
      }

      // CredentialsProvider path: user object will contain local fields
      if (user && (user as any).id) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
