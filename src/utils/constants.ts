import type { DrinkType, Employee, SugarLevel } from "./types";

export const EMPLOYEES: Employee[] = [
  {
    id: "e1",
    name: "Aditi Sharma",
    department: "Design",
    initials: "AS",
    palette: "brand",
    role: "employee",
  },
  {
    id: "e2",
    name: "Rohan Mehta",
    department: "Engineering",
    initials: "RM",
    palette: "coffee",
    role: "employee",
  },
  {
    id: "e3",
    name: "Priya Nair",
    department: "Marketing",
    initials: "PN",
    palette: "rose",
    role: "employee",
  },
  {
    id: "e4",
    name: "Karan Verma",
    department: "Engineering",
    initials: "KV",
    palette: "amber",
    role: "employee",
  },
  {
    id: "e5",
    name: "Sneha Iyer",
    department: "HR",
    initials: "SI",
    palette: "teal",
    role: "employee",
  },
  {
    id: "e6",
    name: "Arjun Reddy",
    department: "Sales",
    initials: "AR",
    palette: "indigo",
    role: "employee",
  },
  {
    id: "e7",
    name: "Meera Joshi",
    department: "Finance",
    initials: "MJ",
    palette: "plum",
    role: "employee",
  },
  {
    id: "e8",
    name: "Vikram Rao",
    department: "Operations",
    initials: "VR",
    palette: "sky",
    role: "employee",
  },
];

export const DRINK_OPTIONS: {
  id: DrinkType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "coffee",
    label: "Coffee",
    emoji: "☕",
    description: "Freshly brewed, hot & bold",
  },
  {
    id: "tea",
    label: "Tea",
    emoji: "🍵",
    description: "Warm, soothing & aromatic",
  },
];

export const SUGAR_LEVELS: { id: SugarLevel; label: string; emoji: string }[] =
  [
    { id: "normal", label: "Normal Sugar", emoji: "🥄" },
    { id: "low", label: "Low Sugar", emoji: "🥄" },
    { id: "without", label: "Without Sugar", emoji: "🚫" },
  ];
