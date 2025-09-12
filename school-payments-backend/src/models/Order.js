// Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  school_id: { type: String, required: true }, // Removed ref since it's now a String
  trustee_id: { type: String },
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String,
  gateway_order_id: String
}, { timestamps: true });

orderSchema.index({ school_id: 1 });

export default mongoose.model("Order", orderSchema);