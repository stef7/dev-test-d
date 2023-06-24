import NextAuth, { type AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "~/clients/prisma-client";

const clientId = process.env["GITHUB_ID"];
const clientSecret = process.env["GITHUB_SECRET"];

if (!clientId || !clientSecret) throw new Error("missing auth client credentials");

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
  providers: [GitHubProvider({ clientId, clientSecret })],
  callbacks: {
    // refreshes token:
    async signIn({ account: accountPassed, user }) {
      const account = accountPassed ? accountPassed : await prisma.account.findFirst({ where: { userId: user.id } });
      if (!account) return true;

      const upserted = { userId: user.id, ...account };
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        create: upserted,
        update: upserted,
      });
      return true;
    },
    async session({ session, user: { id } }) {
      const userWithAccounts = await prisma.user.findUnique({
        where: { id },
        select: { name: true, jobTitle: true, accounts: { select: { access_token: true } } },
      });
      if (!userWithAccounts) return session;

      const { accounts, ...user } = userWithAccounts;

      return {
        ...session,
        user: {
          id,
          githubAccessToken: accounts?.at(-1)?.access_token,
          ...user,
        },
      };
    },
  },
};

export default NextAuth(authOptions);
