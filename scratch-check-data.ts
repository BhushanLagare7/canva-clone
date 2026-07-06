import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const users = await sql`SELECT count(*) FROM "user"`;
  console.log("Users count:", users);
}

main();
