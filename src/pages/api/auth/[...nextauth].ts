import NextAuth, { Session, type AuthOptions } from "next-auth";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) throw new Error("missing auth client credentials");

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token: { accessToken, login } }) {
      return { accessToken, login, ...session };
    },
    async jwt({ token, user, account, profile }) {
      return { login: (profile as GithubProfile)?.login, accessToken: account?.access_token, ...token };
    },
  },
};

export default NextAuth(authOptions);
