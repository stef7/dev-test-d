import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "~/clients/prisma-client";

const handler: NextApiHandler<{} | { error: string }> = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.username) return res.status(401).json({ error: "Unauthorised" });

  const { jobTitle } = req.body;
  if (typeof jobTitle !== "string") return res.status(422).json({ error: "Missing jobTitle" });

  const { username } = session.user;
  await prisma.user.update({ where: { username }, data: { jobTitle } });
  return res.status(200).json({});
};

export default handler;
