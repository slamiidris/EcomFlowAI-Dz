/** One-off: reset the free gating-test user to a clean no-plan state. */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const r = await prisma.user.update({
    where: { email: "free-gating-test@dzads.ai" },
    data: {
      plan: null,
      planStatus: null,
      planSelectedAt: null,
      planActiveFrom: null,
      planExpiresAt: null,
      paymentProof: null,
      paymentMethod: null,
    },
  });
  console.log(`reset ${r.email} -> planStatus=${r.planStatus}`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
