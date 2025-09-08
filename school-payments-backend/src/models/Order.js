import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  trustee_id: { type: String },
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
