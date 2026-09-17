import { Schema, model, models } from "mongoose";
import type { AvatarPalette, EmployeeRole } from "@/src/utils/types";

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

export interface UserDocument {
  username: string;
  passwordHash: string;
  name: string;
  department: string;
  initials: string;
  palette: AvatarPalette;
  avatarUrl?: string;
  role: EmployeeRole;
}

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    initials: { type: String, required: true },
    palette: { type: String, enum: AVATAR_PALETTES, required: true },
    avatarUrl: { type: String },
    role: { type: String, enum: EMPLOYEE_ROLES, required: true, default: "employee" },
  },
  { timestamps: true },
);

export default models.User ?? model<UserDocument>("User", userSchema);
