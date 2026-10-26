import type { WaterRequest as WaterRequestType, WaterRequestStatus } from "@/src/utils/types";

export function toWaterRequest(doc: {
  _id: unknown;
  employee: WaterRequestType["employee"];
  status: WaterRequestStatus;
  createdAt: number;
}): WaterRequestType {
  return {
    id: String(doc._id),
    employee: doc.employee,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
