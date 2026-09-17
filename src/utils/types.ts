export type DrinkType = "coffee" | "tea";

export type SugarLevel = "normal" | "low" | "without";

export type OrderStatus = "pending" | "preparing" | "served";

export type EmployeeRole = "employee" | "pantry";

export type AvatarPalette =
  | "brand"
  | "coffee"
  | "rose"
  | "amber"
  | "teal"
  | "indigo"
  | "plum"
  | "sky";

export interface Employee {
  id: string;
  name: string;
  department: string;
  initials: string;
  palette: AvatarPalette;
  avatarUrl?: string;
  role: EmployeeRole;
}

export interface Order {
  id: string;
  employee: Employee;
  drink: DrinkType;
  sugar: SugarLevel;
  status: OrderStatus;
  createdAt: number;
}
