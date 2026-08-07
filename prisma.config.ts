import path from "path";
import { defineConfig } from "prisma/config";

// Load .env for local dev (Prisma CLI doesn't auto-load it in config)
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres:postgres@localhost:5432/dzads";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: connectionString,
  },
});
