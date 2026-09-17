import Order from "@/src/models/Order";
import { getLastPassedCheckpoint } from "@/src/utils/orderWindow";

// Safety net for a forgotten "Clear board" click: sweeps away any order
// older than the most recently passed checkpoint (12:30 PM / 6:00 PM), the
// same way the manual button does. Orders placed after the checkpoint
// (e.g. during the next window) are untouched. Assumes the caller has
// already called connectToDatabase(). Returns how many orders were swept,
// so callers only broadcast a change when something actually happened.
export async function runAutoClear(): Promise<number> {
  const checkpoint = getLastPassedCheckpoint();
  if (checkpoint === null) return 0;
  const result = await Order.deleteMany({ createdAt: { $lt: checkpoint } });
  return result.deletedCount ?? 0;
}
