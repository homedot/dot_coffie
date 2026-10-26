import { Schema, model, models } from "mongoose";

// One row per subscribed browser/device. `endpoint` is unique per device+
// browser install, so re-subscribing (e.g. after clearing site data) just
// upserts rather than piling up dead rows.
export interface PushSubscriptionDocument {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  employeeId: string;
  employeeName: string;
  // Captured at subscribe time purely for debugging delivery issues — lets
  // us tell a desktop-browser subscription from a phone's at a glance,
  // since a subscription only ever rings on the exact browser install that
  // created it.
  userAgent?: string;
  createdAt: number;
}

const pushSubscriptionSchema = new Schema<PushSubscriptionDocument>({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  userAgent: { type: String },
  createdAt: { type: Number, required: true },
});

export default models.PushSubscription ??
  model<PushSubscriptionDocument>("PushSubscription", pushSubscriptionSchema);
