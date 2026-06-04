import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "@/lib/mongodb";
import { connectDB } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email, provider: "credentials" });
        if (!user?.passwordHash) return null;
        const valid = await verifyPassword(credentials.password as string, user.passwordHash);
        if (!valid) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image ?? null,
          role: user.role,
        };
      },
    }),
  ],
  // JWT strategy is required for Credentials provider — database sessions don't
  // work with credentials-based auth in Auth.js v5.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      // For Google users, look up role from DB on first sign-in
      if (!token.role && token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        token.role = dbUser?.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
