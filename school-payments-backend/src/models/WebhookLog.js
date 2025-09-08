import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema({
  payload: { type: Object },
}, { timestamps: true });

export default mongoose.model("WebhookLog", webhookLogSchema);
