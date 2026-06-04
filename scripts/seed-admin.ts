import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";

if (!MONGODB_URI) { console.error("MONGODB_URI is required"); process.exit(1); }
if (!ADMIN_EMAIL) { console.error("ADMIN_EMAIL is required"); process.exit(1); }
if (!ADMIN_PASSWORD) { console.error("ADMIN_PASSWORD is required"); process.exit(1); }

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  provider: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN_EMAIL!.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD!, 12);
  await User.create({
    email: ADMIN_EMAIL!.toLowerCase(),
    name: ADMIN_NAME,
    role: "admin",
    provider: "credentials",
    passwordHash,
  });

  console.log(`✓ Admin user created: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
