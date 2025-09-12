// OrderStatus.js
import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema({
  collect_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  gateway_order_id: String,
  school_id: String,
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: mongoose.Schema.Types.Mixed, // Change to Mixed type for JSON objects
  bank_reference: String,
  payment_message: String,
  status: String,
  error_message: String,
  payment_time: { type: Date }
}, { timestamps: true });

orderStatusSchema.index({ school_id: 1 });

export default mongoose.model("OrderStatus", orderStatusSchema);