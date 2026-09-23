import type { Order } from "./types";

export interface Floor {
  id: string;
  label: string;
  emoji: string;
  departments: string[];
}

// Office layout: which departments sit on which floor. Department names must
// match the `department` field on the users collection (case-insensitive).
export const FLOORS: Floor[] = [
  {
    id: "ground",
    label: "Ground Floor",
    emoji: "🏢",
    departments: ["MD", "Accountant", "Front Office", "HR"],
  },
  {
    id: "first",
    label: "First Floor",
    emoji: "🏬",
    departments: ["HomeTech", "HomeDot"],
  },
];

export const DEPARTMENTS: string[] = FLOORS.flatMap((f) => f.departments);

// Returns the canonical spelling of a known department, or undefined.
export function canonicalDepartment(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return DEPARTMENTS.find((d) => d.toLowerCase() === key);
}

export interface DepartmentGroup {
  department: string;
  orders: Order[];
}

export interface FloorGroup {
  id: string;
  label: string;
  emoji: string;
  departments: DepartmentGroup[];
  total: number;
}

// Splits orders into floors → departments, in the fixed office order. Only
// departments that have orders are returned. Orders from a department that
// isn't on any floor land in a trailing "Other" floor so nobody gets hidden.
export function groupOrdersByFloor(orders: Order[]): FloorGroup[] {
  const known = new Map<string, Order[]>();
  const other = new Map<string, Order[]>();

  for (const order of orders) {
    const canonical = canonicalDepartment(order.employee.department);
    const bucket = canonical ? known : other;
    const key =
      canonical ?? (order.employee.department.trim() || "No department");
    const list = bucket.get(key);
    if (list) list.push(order);
    else bucket.set(key, [order]);
  }

  const groups: FloorGroup[] = [];

  for (const floor of FLOORS) {
    const departments = floor.departments
      .filter((d) => known.has(d))
      .map((d) => ({ department: d, orders: known.get(d)! }));
    if (departments.length === 0) continue;
    groups.push({
      id: floor.id,
      label: floor.label,
      emoji: floor.emoji,
      departments,
      total: departments.reduce((n, d) => n + d.orders.length, 0),
    });
  }

  if (other.size > 0) {
    const departments = [...other].map(([department, list]) => ({
      department,
      orders: list,
    }));
    groups.push({
      id: "other",
      label: "Other",
      emoji: "📍",
      departments,
      total: departments.reduce((n, d) => n + d.orders.length, 0),
    });
  }

  return groups;
}
