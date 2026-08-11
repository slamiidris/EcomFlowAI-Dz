/**
 * One-off migration: encrypt legacy plaintext ad-platform tokens already in
 * the api_settings table. Idempotent — skips values already encrypted.
 * Run: npx tsx scripts/migrate-encrypt-tokens.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { encryptSecret, isEncryptedSecret } from "../src/lib/crypto";

const SECRET_FIELDS = [
  "facebookAdsToken",
  "tiktokAdsToken",
  "googleAdsDeveloperToken",
  "snapAdsToken",
  "geminiApiKey",
  "customApiToken",
] as const;

async function main() {
  const rows = await prisma.apiSettings.findMany();
  let changed = 0;
  for (const row of rows) {
    const data: Record<string, string> = {};
    for (const f of SECRET_FIELDS) {
      const v = (row as Record<string, unknown>)[f];
      if (typeof v === "string" && v !== "" && !isEncryptedSecret(v)) {
        data[f] = encryptSecret(v);
      }
    }
    if (Object.keys(data).length) {
      await prisma.apiSettings.update({ where: { id: row.id }, data });
      changed += 1;
    }
  }
  console.log(`encrypted token fields for ${changed} api_settings row(s)`);
  await prisma.$disconnect();
}
main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
