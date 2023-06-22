import NextAuth, { type AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "~/clients/prisma-client";

if (!process.env["GITHUB_ID"] || !process.env["GITHUB_SECRET"]) throw new Error("missing auth client credentials");

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubAccessToken: string;
      name: string;
      jobTitle: string;
    };
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env["GITHUB_ID"],
      clientSecret: process.env["GITHUB_SECRET"],
    }),
  ],
  callbacks: {
    async session({ session, user: { id } }) {
      const prismaUser = await prisma.user.findUnique({
        where: { id },
        select: { name: true, jobTitle: true, accounts: { take: 1, select: { access_token: true } } },
      });
      if (!prismaUser) return session;

      const {
        accounts: [account],
        ...user
      } = prismaUser;

      return {
        ...session,
        user: {
          id,
          githubAccessToken: account?.access_token,
          ...user,
        },
      };
    },
  },
};

export default NextAuth(authOptions);
