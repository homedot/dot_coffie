import type { DrinkType, Order as OrderType, SugarLevel } from "@/src/utils/types";

export function toOrder(doc: {
  _id: unknown;
  employee: OrderType["employee"];
  drink: DrinkType;
  sugar: SugarLevel;
  status: OrderType["status"];
  createdAt: number;
}): OrderType {
  return {
    id: String(doc._id),
    employee: doc.employee,
    drink: doc.drink,
    sugar: doc.sugar,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
