import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "~/clients/prisma-client";

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) throw new Error("missing auth client credentials");

const getOrCreateUser = async (username: string) =>
  (await prisma.user.findUnique({ where: { username } })) ?? (await prisma.user.create({ data: { username } }));

declare module "next-auth" {
  interface User extends Awaited<ReturnType<typeof getOrCreateUser>> {}
  interface Session {
    user?: User;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Username",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials, _req) {
        if (!credentials) throw new Error("missing credentials");
        return await getOrCreateUser(credentials.username);
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      console.log(this.session!.name, { user });
      return { user, ...session };
    },
    async jwt({ token, user, account, profile }) {
      return { user, account, profile, ...token };
    },
  },
};

export default NextAuth(authOptions);
