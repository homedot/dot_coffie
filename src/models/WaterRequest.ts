import { Schema, model, models } from "mongoose";
import type { AvatarPalette, Employee, WaterRequestStatus } from "@/src/utils/types";

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

export interface WaterRequestDocument {
  employee: Employee;
  status: WaterRequestStatus;
  createdAt: number;
}

const employeeSchema = new Schema<Employee>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    initials: { type: String, required: true },
    palette: { type: String, enum: AVATAR_PALETTES, required: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ["employee", "pantry"], required: true, default: "employee" },
  },
  { _id: false },
);

const waterRequestSchema = new Schema<WaterRequestDocument>({
  employee: { type: employeeSchema, required: true },
  status: { type: String, enum: ["pending", "filled"], default: "pending", required: true },
  createdAt: { type: Number, required: true },
});

export default models.WaterRequest ?? model<WaterRequestDocument>("WaterRequest", waterRequestSchema);
