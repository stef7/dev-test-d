import NextAuth, { type AuthOptions } from "next-auth";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "~/clients/prisma-client";

const clientId = process.env["GITHUB_ID"];
const clientSecret = process.env["GITHUB_SECRET"];

if (!clientId || !clientSecret) throw new Error("missing auth client credentials");

const getUserAndAccounts = async (userId: string) =>
  await prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });

declare module "next-auth" {
  interface Session {
    user: Awaited<ReturnType<typeof getUserAndAccounts>>;
  }
  interface Profile extends GithubProfile {}
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [GitHubProvider({ clientId, clientSecret })],
  session: {
    maxAge: 28800, // GitHub tokens expire in 8 hours
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (profile && account) Object.assign(account, { login: profile.login }); // make login available in account
      return true;
    },
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...user,
          ...(await getUserAndAccounts(user.id)),
        },
      };
    },
  },
};

export default NextAuth(authOptions);
