import { identityDb } from "../config/db.js";
import { Role } from "../generated/identity/client.js";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  try {
    console.log(" Seeding Admin user...");

    // Hash the password (12 rounds is the current industry standard)
    const hashedPassword = await bcrypt.hash("Admin@2026", 12);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const admin = await identityDb.user.create({
      data: {
        firstName: "Mohmaed",
        lastName: "Belghait",
        email: "belghaitmohamed1@gmail.com",
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    console.log(" Admin user created successfully!");
    console.log("📧 Email: ${admin.email}");
    console.log("🔑 Password: Admin@2026");
  } catch (error) {
    console.error(" Failed to seed admin:", error);
  } finally {
    await identityDb.$disconnect();
  }
}

seedAdmin();
