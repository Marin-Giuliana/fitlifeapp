import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { NextAuthOptions } from "next-auth";


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
          await connectToDatabase();


          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          if (user.parola !== credentials.password) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.nume,
            email: user.email,
            role: user.rol,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase();
          
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            existingUser = await User.create({
              nume: user.name,
              email: user.email,
              rol: "membru",
              parola: null,
              googleId: user.id,
            });
          }
          
          user.id = existingUser._id.toString();
          user.role = existingUser.rol;
          
          return true;
        } catch (error) {
          console.error("Google OAuth error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/auth/callback')) {
        return url;
      }
      
      if (url.startsWith(baseUrl) && url !== baseUrl) {
        return url;
      }
      
      if (url === baseUrl || !url.startsWith(baseUrl)) {
        return `${baseUrl}/auth/callback`;
      }
      
      return url;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  }
};