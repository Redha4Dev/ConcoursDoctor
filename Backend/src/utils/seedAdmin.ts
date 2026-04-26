import { identityDb } from "../config/db.js";
import { Role } from "../generated/identity/client.js";
import bcrypt from "bcryptjs";
import { tempPasswordTemplate } from "./emailTemplates.js";
import { sendEmail } from "./mailer.js";

async function seedAdmin() {
  try {
    console.log(" Seeding Admin user...");

    // Hash the password (12 rounds is the current industry standard)
    const password = "Admin@2026";

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await identityDb.user.create({
      data: {
        firstName: "Anis",
        lastName: "Boulgheb",
        email: "anisboulgheb@gmail.com",
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
      },
    });
      const fullName = `${admin.firstName} ${admin.lastName}`;

      const { subject, html } = tempPasswordTemplate(
        fullName,
        admin.email,
        password,
        admin.role,
      );
      try {
        await sendEmail({ emailto: admin.email, subject, html });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`[Email] Failed to send welcome email to ${admin.email}:`, err);
      }

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
