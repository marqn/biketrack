import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import StravaProvider from "next-auth/providers/strava";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read,activity:read_all,profile:read_all",
          approval_prompt: "auto",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Nieprawidłowe dane logowania");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Nieprawidłowy email lub hasło");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Nieprawidłowy email lub hasło");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
  ],
  pages: {
    signIn: "/app",
    signOut: "/",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        if (account) {
          token.provider = account.provider;
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string | null;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
        session.user.provider = token.provider as string;
      }
      
      return session;
    },

    // 👇 DODAJ TEN CALLBACK
    async redirect({ url, baseUrl }) {
      // Jeśli URL zawiera callbackUrl, użyj go
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Jeśli URL jest na tym samym baseUrl
      if (url.startsWith(baseUrl)) return url;
      
      // W przeciwnym razie przekieruj na onboarding
      return `${baseUrl}/onboarding`;
    },

    async signIn({ account, user }) {
      if (account?.provider === "strava") {
        delete (account as any).athlete;
      }

      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
