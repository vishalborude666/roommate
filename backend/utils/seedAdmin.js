import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const run = async () => {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL || "admin@roomatch.app";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  await User.create({ name: "Platform Admin", email, password, role: "admin" });
  console.log(`Admin created -> email: ${email} | password: ${password}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
