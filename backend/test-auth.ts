import "dotenv/config";
import { loginUser } from "./src/services/auth.service.js";

async function test() {
  try {
    const res = await loginUser("admin@fundsroom.com", "Admin@123");
    console.log("LOGIN SUCCESS:", res);
  } catch (e: any) {
    console.error("LOGIN ERROR:", e.message, e.stack);
  }
}

test();
