import { Schema, model, models } from "mongoose";
import type { AvatarPalette, DrinkType, Employee, OrderStatus, SugarLevel } from "@/src/utils/types";

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

export interface OrderDocument {
  employee: Employee;
  drink: DrinkType;
  sugar: SugarLevel;
  status: OrderStatus;
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

const orderSchema = new Schema<OrderDocument>({
  employee: { type: employeeSchema, required: true },
  drink: { type: String, enum: ["coffee", "tea"], required: true },
  sugar: { type: String, enum: ["normal", "low", "without"], required: true },
  status: {
    type: String,
    enum: ["pending", "preparing", "served"],
    default: "pending",
    required: true,
  },
  createdAt: { type: Number, required: true },
});

export default models.Order ?? model<OrderDocument>("Order", orderSchema);
