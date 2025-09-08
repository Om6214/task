import axios from "axios";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import OrderStatus from "../models/OrderStatus.js";
import WebhookLog from "../models/WebhookLog.js";

// ---------------------------
// 1. Create Payment
// ---------------------------
export const createPayment = async (req, res) => {
    try {
        const { amount, student_info, trustee_id } = req.body;

        // Debug environment variables
        console.log("Env check:", {
            SCHOOL_ID: process.env.SCHOOL_ID,
            PG_KEY: process.env.PG_KEY,
            API_KEY: process.env.PAYMENT_API_KEY
        });

        // Save order in DB
        const order = await Order.create({
            school_id: process.env.SCHOOL_ID,
            trustee_id,
            student_info,
            gateway_name: "Edviron"
        });

        // Payload for Edviron API
        const payload = {
            school_id: process.env.SCHOOL_ID,
            amount: amount.toString(),
            callback_url: "https://google.com"
        };

        // Generate JWT sign
        const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

        // Call Edviron API
        const response = await axios.post(
            "https://dev-vanilla.edviron.com/erp/create-collect-request",
            { ...payload, sign },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`
                }
            }
        );

        console.log("Edviron response:", response.data);

        // Save initial order status
        await OrderStatus.create({
            collect_id: order._id,
            order_amount: amount,
            status: "PENDING"
        });

        return res.status(200).json({
            message: "Payment initiated",
            collect_request_id: response.data.collect_request_id || null,
            redirect_url: response.data.collect_request_url || response.data.payment_url || null
        });
    } catch (err) {
        console.error("Edviron error:", err.response?.data || err.message);
        return res.status(500).json({
            message: "Payment error",
            error: err.response?.data || err.message
        });
    }
};

// ---------------------------
// 2. Check Payment Status
// ---------------------------
export const checkPaymentStatus = async (req, res) => {
    try {
        const { collect_request_id } = req.params;

        // Generate JWT sign
        const sign = jwt.sign(
            { school_id: process.env.SCHOOL_ID, collect_request_id },
            process.env.PG_KEY,
            { algorithm: "HS256" }
        );

        // Call Edviron API to get payment status
        const response = await axios.get(
            `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${process.env.SCHOOL_ID}&sign=${sign}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`
                }
            }
        );

        const data = response.data;

        console.log("Edviron status response:", data);

        // Update OrderStatus in DB based on real-time status
        const update = {
            status: data.status || "PENDING",
            transaction_amount: data.amount || null,
            payment_time: data.payment_time ? new Date(data.payment_time) : null,
            payment_mode: data.payment_mode || null,
            payment_details: data.payment_details || null,
            bank_reference: data.bank_reference || null,
            payment_message: data.payment_message || null,
            error_message: data.error_message || null
        };

        await OrderStatus.findOneAndUpdate(
            { collect_id: collect_request_id },
            update,
            { upsert: true, new: true }
        );

        return res.json(data);
    } catch (err) {
        console.error("Status check error:", err.response?.data || err.message);
        return res.status(500).json({
            message: "Status check failed",
            error: err.response?.data || err.message
        });
    }
};

// ---------------------------
// 3. Handle Webhook
// ---------------------------
export const handleWebhook = async (req, res) => {
    try {
        const { order_info } = req.body;

        if (!order_info || !order_info.order_id) {
            return res.status(400).json({ message: "Invalid webhook payload" });
        }

        // Log webhook payload for debugging/audit
        await WebhookLog.create({ payload: req.body });

        // Prepare data to update OrderStatus
        const updateData = {
            order_amount: order_info.order_amount,
            transaction_amount: order_info.transaction_amount,
            payment_mode: order_info.payment_mode,
            payment_details: order_info.payemnt_details || order_info.payment_details,
            bank_reference: order_info.bank_reference,
            payment_message: order_info.Payment_message,
            status: order_info.status.toUpperCase(),
            error_message: order_info.error_message,
            payment_time: order_info.payment_time ? new Date(order_info.payment_time) : null
        };

        // Update or insert OrderStatus
        const updatedOrder = await OrderStatus.findOneAndUpdate(
            { collect_id: order_info.order_id },
            updateData,
            { upsert: true, new: true }
        );

        console.log("Webhook processed:", updatedOrder);

        return res.status(200).json({ message: "Webhook processed" });
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(500).json({ message: "Webhook error", error: err.message });
    }
};
