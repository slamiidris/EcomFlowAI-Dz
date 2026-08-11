/** One-off: inspect the free gating-test user's plan state. */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const u = await prisma.user.findUnique({
    where: { email: "free-gating-test@dzads.ai" },
    select: { id: true, email: true, plan: true, planStatus: true, planActiveFrom: true, planExpiresAt: true, planSelectedAt: true, isAdmin: true, createdAt: true },
  });
  console.log(JSON.stringify(u, null, 2));
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
