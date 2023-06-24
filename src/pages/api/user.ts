import { NextApiHandler } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "~/clients/prisma-client";
import type { User } from "@prisma/client";

export type UserResponseBody = User | { error: string };

/** Todo: write an API handler wrapper utility that:
 * - supports simply returning a value to be sent as JSON etc...
 * - checks if user is authorised (if endpoint is protected)
 * - checks specified method is supported
 * - check if required parameters or body properties are provided, and of what type/class! and then send appropriate error code if not
 * - supports throwing a custom ApiError class with status code and message etc... that class could also provide status code helpers, or maybe just default to 500 if not provided
 */
const handler: NextApiHandler<UserResponseBody> = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not supported" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user.id) return res.status(401).json({ error: "Unauthorised" });

  const { name, jobTitle } = req.body;
  if (typeof name !== "string") return res.status(422).json({ error: "Missing name" });
  if (typeof jobTitle !== "string") return res.status(422).json({ error: "Missing jobTitle" });

  return res.status(200).json(await prisma.user.update({ where: { id: session.user.id }, data: { name, jobTitle } }));
};

export default handler;
