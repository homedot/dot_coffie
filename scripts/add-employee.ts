import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { connectToDatabase } from "@/src/lib/mongodb";
import User from "@/src/models/User";
import { DEPARTMENTS, FLOORS, canonicalDepartment } from "@/src/utils/floors";
import type { AvatarPalette, EmployeeRole } from "@/src/utils/types";

config({ path: ".env.local" });

const AVATAR_PALETTES: AvatarPalette[] = [
  "brand",
  "coffee",
  "rose",
  "amber",
  "teal",
  "indigo",
  "plum",
  "sky",
];

const EMPLOYEE_ROLES: EmployeeRole[] = ["employee", "pantry"];

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const username = arg("username");
  const password = arg("password");
  const name = arg("name");
  const departmentArg = arg("department");
  const initials = arg("initials");
  const palette = (arg("palette") ?? "brand") as AvatarPalette;
  const avatarUrl = arg("avatarUrl");
  const role = (arg("role") ?? "employee") as EmployeeRole;

  if (!username || !password || !name || !departmentArg || !initials) {
    console.error(
      `Usage: tsx scripts/add-employee.ts --username=<u> --password=<p> --name="<n>" --department="<d>" --initials=<ab> [--palette=brand] [--avatarUrl=/employees/photo.jpg] [--role=employee|pantry]\n` +
        `Departments: ${DEPARTMENTS.join(", ")}`,
    );
    process.exit(1);
  }
  // Pantry staff aren't on a floor, so any label is fine for them; everyone
  // else must be in a known department so the pantry board can place them.
  const department = canonicalDepartment(departmentArg) ?? (role === "pantry" ? departmentArg : undefined);
  if (!department) {
    console.error(`--department must be one of: ${DEPARTMENTS.join(", ")}`);
    process.exit(1);
  }
  if (!AVATAR_PALETTES.includes(palette)) {
    console.error(`--palette must be one of: ${AVATAR_PALETTES.join(", ")}`);
    process.exit(1);
  }
  if (!EMPLOYEE_ROLES.includes(role)) {
    console.error(`--role must be one of: ${EMPLOYEE_ROLES.join(", ")}`);
    process.exit(1);
  }

  await connectToDatabase();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { username: username.toLowerCase() },
    { username: username.toLowerCase(), passwordHash, name, department, initials, palette, avatarUrl, role },
    { upsert: true, returnDocument: "after" },
  );

  const floor = FLOORS.find((f) => f.departments.includes(user.department));
  console.log(
    `Saved employee "${user.name}" (username: ${user.username}, role: ${user.role}, department: ${user.department}${floor ? `, ${floor.label}` : ""})`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to add employee:", err);
  process.exit(1);
});
