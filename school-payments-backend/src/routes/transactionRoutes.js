import express from "express";
import {
  getAllTransactions,
  getTransactionsBySchool,
  getTransactionStatus
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllTransactions);
router.get("/school/:schoolId", protect, getTransactionsBySchool);
router.get("/status/:custom_order_id", protect, getTransactionStatus);

export default router;
