import express from "express";
import { checkPaymentStatus, createPayment, handleWebhook } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-payment", protect, createPayment);
router.post("/webhook",protect, handleWebhook);
router.post("/check-status/:collect_request_id",protect, checkPaymentStatus);

export default router;
