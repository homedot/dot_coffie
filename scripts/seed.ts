import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { connectToDatabase } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import { EMPLOYEES } from "@/src/utils/constants";

config({ path: ".env.local" });

const DEFAULT_PASSWORD = "coffee123";

async function seed() {
  await connectToDatabase();

  const rows: { username: string; password: string }[] = [];

  for (const employee of EMPLOYEES) {
    const username = employee.name.split(" ")[0].toLowerCase();
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await User.findOneAndUpdate(
      { username },
      {
        username,
        passwordHash,
        name: employee.name,
        department: employee.department,
        initials: employee.initials,
        palette: employee.palette,
        role: "employee",
      },
      { upsert: true },
    );

    rows.push({ username, password: DEFAULT_PASSWORD });
  }

  console.log(`Seeded ${rows.length} employee accounts (password for all: "${DEFAULT_PASSWORD}"):`);
  console.table(rows);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
