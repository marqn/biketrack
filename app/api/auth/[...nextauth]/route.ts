import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import StravaProvider from "next-auth/providers/strava";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      // Ogranicz profile data od Google
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          // Skróć długie URL-e avatarów
          image: profile.picture?.includes('googleusercontent.com') 
            ? profile.picture.split('=')[0] + '=s96-c' // max 96px
            : profile.picture,
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
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
    signIn: "/login",
    signOut: "/",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Pierwsze logowanie - ustaw podstawowe dane
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        
        if (account) {
          token.provider = account.provider;
        }

        // ✅ ZAWSZE pobierz AKTUALNY avatar i plan z bazy przy logowaniu
        // NIE ufaj user.image z OAuth providera
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { image: true, plan: true, planExpiresAt: true }
        });

        token.picture = dbUser?.image && dbUser.image.length > 200
          ? dbUser.image.substring(0, 200)
          : dbUser?.image;

        // Sprawdź czy premium nie wygasł
        const isPremiumActive = dbUser?.plan === "PREMIUM" && dbUser.planExpiresAt && dbUser.planExpiresAt > new Date();
        token.plan = isPremiumActive ? "PREMIUM" : "FREE";
        token.planExpiresAt = dbUser?.planExpiresAt?.toISOString() ?? null;
      }

      // Aktualizacja sesji (np. po zmianie avatara w profilu)
      if (trigger === "update" && session) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            plan: true,
            planExpiresAt: true,
          }
        });

        if (updatedUser) {
          token.email = updatedUser.email;
          token.name = updatedUser.name;
          token.picture = updatedUser.image && updatedUser.image.length > 200
            ? updatedUser.image.substring(0, 200)
            : updatedUser.image;

          const isPremiumActive = updatedUser.plan === "PREMIUM" && updatedUser.planExpiresAt && updatedUser.planExpiresAt > new Date();
          token.plan = isPremiumActive ? "PREMIUM" : "FREE";
          token.planExpiresAt = updatedUser.planExpiresAt?.toISOString() ?? null;
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string | null;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
        session.user.provider = token.provider as string;
        session.user.plan = (token.plan as "FREE" | "PREMIUM") ?? "FREE";
        session.user.planExpiresAt = (token.planExpiresAt as string | null) ?? null;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/app`;
    },

    async signIn({ account, user }) {
      if (account?.provider === "strava") {
        delete (account as any).athlete;
      }

      // Skróć długie URL-e przed zapisaniem do bazy
      if (user.image && user.image.length > 500) {
        user.image = user.image.substring(0, 500);
      }

      if (account?.provider !== "credentials" && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, email: true, image: true }, // Dodaj image
        });

        if (existingUser) {
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: account.provider,
            },
            select: { id: true },
          });

          if (!existingAccount && account) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                token_type: account.token_type,
                scope: account.scope,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
            });
          } else if (existingAccount && account?.provider === "strava") {
            // Aktualizuj tokeny Strava przy każdym logowaniu
            await prisma.account.update({
              where: { id: existingAccount.id },
              data: {
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
            });
          }

          // ✅ Aktualizuj avatar TYLKO jeśli użytkownik nie ma jeszcze avatara
          // NIE nadpisuj avatara przy każdym logowaniu
          if (!existingUser.image && user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                image: user.image.length > 500 
                  ? user.image.substring(0, 500) 
                  : user.image 
              },
            });
          }
        }
      }

      return true;
    },
  },
  // Dodaj to żeby zmniejszyć rozmiar cookies
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  // Debug mode - usuń w produkcji
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };