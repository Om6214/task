import Order from "../models/Order.js";
import OrderStatus from "../models/OrderStatus.js";
import mongoose from "mongoose";

// Get all transactions with full order details
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await OrderStatus.aggregate([
      {
        $lookup: {
          from: "orders",         // collection to join
          localField: "collect_id", // field in OrderStatus
          foreignField: "_id",    // field in Orders
          as: "order_info"
        }
      },
      { $unwind: "$order_info" },   // flatten the array
      {
        $project: {
          _id: 1,
          collect_id: 1,
          transaction_amount: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          order_info: 1 // include full order info
        }
      }
    ]);

    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching transactions", error: err.message });
  }
};

// Get transactions filtered by school with full order details
export const getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const transactions = await OrderStatus.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "order_info"
        }
      },
      { $unwind: "$order_info" },
      { $match: { "order_info.school_id": new mongoose.Types.ObjectId(schoolId) } }
    ]);
    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching school transactions", error: err.message });
  }
};

// Get transaction status (unchanged)
export const getTransactionStatus = async (req, res) => {
  try {
    const { custom_order_id } = req.params;
    const transaction = await OrderStatus.findOne({ collect_id: custom_order_id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    return res.json({ status: transaction.status });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching transaction status", error: err.message });
  }
};
