import type { DrinkType, Order as OrderType, StrengthLevel, SugarLevel } from "@/src/utils/types";

export function toOrder(doc: {
  _id: unknown;
  employee: OrderType["employee"];
  drink: DrinkType;
  sugar: SugarLevel;
  strength: StrengthLevel;
  status: OrderType["status"];
  createdAt: number;
}): OrderType {
  return {
    id: String(doc._id),
    employee: doc.employee,
    drink: doc.drink,
    sugar: doc.sugar,
    strength: doc.strength,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
