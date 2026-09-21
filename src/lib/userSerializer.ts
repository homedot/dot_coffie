import type { AvatarPalette, Employee, EmployeeRole } from "@/src/utils/types";

// Shape of a lean() User document. passwordHash is deliberately left out so
// it can never leak through an API response.
interface LeanUser {
  _id: { toString(): string };
  name: string;
  department: string;
  initials: string;
  palette: AvatarPalette;
  avatarUrl?: string;
  role: EmployeeRole;
}

export function toEmployee(user: LeanUser): Employee {
  return {
    id: user._id.toString(),
    name: user.name,
    department: user.department,
    initials: user.initials,
    palette: user.palette,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}
