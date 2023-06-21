import NextAuth, { type Account, type Profile, type AuthOptions, type User } from "next-auth";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "~/clients/prisma-client";

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) throw new Error("missing auth client credentials");

interface TokenPlus {
  user: User;
  account: Account | null;
  profile: Profile | undefined;
}
interface SessionPlus {
  accessToken: string | undefined;
  login: string | undefined;
}
declare module "next-auth" {
  interface Session extends Partial<SessionPlus> {}
  interface Profile extends GithubProfile {}
}

export const authOptions: AuthOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token: tokenUntyped }) {
      const token = tokenUntyped as unknown as TokenPlus | undefined;
      return {
        accessToken: token?.account?.access_token,
        login: token?.profile?.login,
        ...session,
      } satisfies SessionPlus;
    },
    async jwt({ token, user, account, profile }) {
      return { user, account, profile, ...token } satisfies TokenPlus;
    },
  },
};

export default NextAuth(authOptions);
