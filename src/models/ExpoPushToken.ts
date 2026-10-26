import { Schema, model, models } from "mongoose";

// One row per device registered through the native dot-coffie-app (Expo),
// kept separate from PushSubscription (the browser/Web Push model) since
// the token shape and send mechanism are both completely different.
export interface ExpoPushTokenDocument {
  token: string;
  employeeId: string;
  employeeName: string;
  createdAt: number;
}

const expoPushTokenSchema = new Schema<ExpoPushTokenDocument>({
  token: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  createdAt: { type: Number, required: true },
});

export default models.ExpoPushToken ??
  model<ExpoPushTokenDocument>("ExpoPushToken", expoPushTokenSchema);
