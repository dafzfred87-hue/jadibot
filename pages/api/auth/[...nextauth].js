import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { logUser } from "../../../lib/storage";
import { isBlocked } from "../../../lib/storage";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/" },
  callbacks: {
    async signIn({ user, profile }) {
      // Log user
      logUser({ email: user.email, name: user.name, image: user.image });
      // Firewall check
      if (isBlocked(user.email, null)) return false;
      return true;
    },
    async session({ session, token }) {
      if (session?.user) session.user.id = token.sub;
      return session;
    },
    async jwt({ token }) { return token; },
  },
};

export default NextAuth(authOptions);
