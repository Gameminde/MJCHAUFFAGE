import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/services/authService";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Appel au service d'authentification du backend
          const user = await authService.login(credentials.email, credentials.password);

          if (user && user.id) {
            // Retourner les informations utilisateur nécessaires pour la session
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
          
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          // Gérer les erreurs d'authentification, par exemple, logger et retourner null
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // L'objet `user` est celui retourné par `authorize`
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Le `token` est celui retourné par le callback `jwt`
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export types and utilities needed by other components
export interface SessionData {
  isLoggedIn?: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export function requireAuth() {
  // This is a placeholder function for authentication requirement
  // In a real implementation, this would check session and redirect if needed
  return true;
}