import app from "./app.js";
import prisma from "./config/db.js";
import env from "./config/env.js";


async function main() {
  await prisma.$connect()
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
